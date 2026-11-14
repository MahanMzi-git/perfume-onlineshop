from django.db import migrations

FAMILIES = {'floral': ['rose', 'jasmine', 'iris', 'tuberose'], 'woody': ['cedar', 'sandalwood', 'vetiver'], 'citrus': ['bergamot', 'lemon'], 'aquatic': ['seasalt', 'mint'], 'amber': ['amber', 'vanilla', 'incense'], 'fruity': ['pear'], 'spicy': ['pepper'], 'gourmand': ['vanilla', 'sandalwood'], 'aromatic': ['lavender', 'mint'], 'chypre': ['bergamot', 'patchouli'], 'fougere': ['lavender', 'bergamot', 'vetiver'], 'leather': ['leather', 'incense'], 'green': ['mint', 'patchouli', 'vetiver']}
NOTES = {'rose': 'گل رز', 'jasmine': 'یاس', 'bergamot': 'برگاموت', 'lemon': 'لیمو', 'cedar': 'سدر', 'sandalwood': 'صندل', 'seasalt': 'نمک دریا', 'amber': 'عنبر', 'pear': 'گلابی', 'pepper': 'فلفل', 'vanilla': 'وانیل', 'musk': 'مشک', 'lavender': 'اسطوخودوس', 'oud': 'عود', 'patchouli': 'پچولی', 'vetiver': 'وتیور', 'mint': 'نعنا', 'iris': 'زنبق', 'leather': 'چرم', 'incense': 'بخور', 'apricot': 'زردآلو', 'tuberose': 'مریم'}

def seed(apps, schema_editor):
    db = schema_editor.connection.alias
    family = apps.get_model("catalog", "FragranceFamily").objects.using(db)
    note = apps.get_model("catalog", "ScentNote").objects.using(db)
    link = apps.get_model("catalog", "FamilyNote").objects.using(db)
    for family_slug, note_slugs in FAMILIES.items():
        current_family = family.get(slug=family_slug)
        for slug in note_slugs:
            current_note, _ = note.get_or_create(slug=slug, defaults={"name": NOTES[slug]})
            link.get_or_create(family=current_family, note=current_note)


class Migration(migrations.Migration):
    dependencies = [("catalog", "0007_scentnote_familynote_fragrancefamily_notes_and_more")]
    operations = [migrations.RunPython(seed, migrations.RunPython.noop)]
