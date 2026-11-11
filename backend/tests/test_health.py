from unittest.mock import patch

from django.db import OperationalError
from django.test import SimpleTestCase


class HealthTests(SimpleTestCase):
    @patch("aroma.health.connection")
    def test_liveness_does_not_use_database(self, database):
        response = self.client.get("/health/live/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok"})
        database.cursor.assert_not_called()

    @patch("aroma.health.connection")
    def test_readiness_executes_database_query(self, database):
        response = self.client.get("/health/ready/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok"})
        database.cursor.return_value.__enter__.return_value.execute.assert_called_once_with(
            "SELECT 1"
        )

    @patch("aroma.health.connection")
    def test_readiness_hides_connection_error(self, database):
        database.cursor.side_effect = OperationalError("private database connection detail")
        response = self.client.get("/health/ready/")
        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.json(), {"status": "unavailable"})

    def test_probes_reject_post(self):
        for path in ("/health/live/", "/health/ready/"):
            with self.subTest(path=path):
                self.assertEqual(self.client.post(path).status_code, 405)

    def test_probes_reject_untrusted_host(self):
        response = self.client.get("/health/live/", HTTP_HOST="untrusted.example")
        self.assertEqual(response.status_code, 400)
