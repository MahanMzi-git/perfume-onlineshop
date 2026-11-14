from django.db import migrations


def seed_families(apps, schema_editor):
    family = apps.get_model("catalog", "FragranceFamily")
    for slug, name in (('floral', 'گلی'), ('woody', 'چوبی'), ('citrus', 'مرکباتی'), ('aquatic', 'تازه / دریایی'), ('amber', 'عنبری'), ('fruity', 'میوه\u200cای'), ('spicy', 'ادویه\u200cای'), ('gourmand', 'خوراکی'), ('aromatic', 'آروماتیک'), ('chypre', 'شیپر'), ('fougere', 'فوژه'), ('leather', 'چرمی'), ('green', 'سبز')):
        family.objects.using(schema_editor.connection.alias).get_or_create(slug=slug, defaults={"name": name})


class Migration(migrations.Migration):
    dependencies = [("catalog", "0005_fragrancefamily_product_fragrance_families")]
    operations = [migrations.RunPython(seed_families, migrations.RunPython.noop)]
