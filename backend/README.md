# Aroma backend — Phase 0

Run the following in PowerShell from the repository root. Use Python 3.14 and a local PostgreSQL server. Create a database owned by a dedicated application login and provision its PostgreSQL password file separately.

```powershell
python -m venv .venv
$python = '.\.venv\Scripts\python.exe'
& $python -m pip install -r backend/requirements.txt
$env:DJANGO_SECRET_KEY = & $python -c "from secrets import token_urlsafe; print(token_urlsafe(48))"
$env:PGPASSFILE = (Resolve-Path -LiteralPath '.env.pgpass').Path
& $python backend/manage.py check
& $python backend/manage.py test --settings=aroma.test_settings --top-level-directory backend backend/tests
& $python backend/manage.py runserver 127.0.0.1:8000 --noreload
```

The defaults are `PGDATABASE=aroma_dev`, `PGUSER=aroma_app`, `PGHOST=127.0.0.1`, and `PGPORT=5432`. Set those environment variables if your setup differs. Match them in the password file. Set `DJANGO_DEBUG=1` only for local debugging. `DJANGO_ALLOWED_HOSTS` accepts a comma-separated list without spaces. Keep the secret key and password file outside Git.

| Endpoint | Expected result |
| --- | --- |
| `GET /health/live/` | `200`, `{"status":"ok"}`, independent of PostgreSQL |
| `GET /health/ready/` | `200`, `{"status":"ok"}`, when PostgreSQL accepts the check. `503`, `{"status":"unavailable"}`, on connection failure. |

From a second PowerShell window, run `curl.exe -i http://127.0.0.1:8000/health/live/` and repeat for `/health/ready/`.

To simulate a failed connection, open a separate PowerShell window and repeat the environment setup. Set `PGPORT` to a verified unused local port. Start the WSGI application with the Python standard library server because Django's `runserver` performs a database migration check at startup.

```powershell
$env:PGPORT = '15432'  # Example only; confirm the port is unused.
& $python -c 'import sys; sys.path.insert(0, "backend"); from aroma.wsgi import application; from wsgiref.simple_server import make_server; make_server("127.0.0.1", 8001, application).serve_forever()'
```

Query both endpoints on HTTP port 8001. Liveness should return 200 and readiness should return 503.


The development server is for local use. Automated backend tests use disposable in-memory SQLite. Verify the catalog migration and API separately against PostgreSQL.

## Product detail API preview

The public read endpoint is `GET /api/v1/products/<slug>/`. It returns a published
product and its active variants ordered by volume, concentration, and ID. Missing
or unpublished products return 404. Published products without active variants
return an empty array. `price_unit: "IRT"` is Aroma's API label for whole tomans.
Variant IDs are strings. The endpoint has no inventory or purchase operations.

```json
{
  "slug": "aroma-api-preview",
  "name": "Aroma Browser Sample",
  "price_unit": "IRT",
  "variants": [
    {"id": "1", "sku": "AROMA-60", "volume_ml": 60, "concentration": "EDP", "price": 1200000}
  ]
}
```

Use a disposable PostgreSQL database or schema and the environment setup above.
Apply `python backend/manage.py migrate` using the project's virtual environment,
then create a published product and at least two active variants with distinct SKUs
and prices using Django's shell. For example, in an empty test schema:

```powershell
& $python backend/manage.py shell -c 'from catalog.models import Product, Variant; p = Product.objects.create(slug="aroma-api-preview", name="Aroma Browser Sample", is_published=True); Variant.objects.create(product=p, sku="AROMA-60", volume_ml=60, concentration="EDP", price=1200000); Variant.objects.create(product=p, sku="AROMA-100", volume_ml=100, concentration="EDP", price=1800000)'
```

Run Django at `127.0.0.1:8000`. In another PowerShell window set
`$env:VITE_PRODUCT_DETAIL_API_SLUG = 'aroma-api-preview'` and start
`npm run dev -- --host 127.0.0.1`. Open
`http://127.0.0.1:5173/perfume-onlineshop/#/product/aroma-api-preview`.
Changing the version should change the displayed price. The Vite dev proxy
forwards this request to Django. The opt-in preview applies only to the chosen
slug in development.
