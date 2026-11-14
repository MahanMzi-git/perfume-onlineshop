import { Sun, Sunrise, Sunset, Moon, Flower2, Leaf, Snowflake, Briefcase, Heart, CalendarDays, Shirt, Check } from 'lucide-react';
import { splitUsage, type UsageKey } from './usageOptions';
export { usageFields } from './usageOptions';

const icons = { بهار: Flower2, تابستان: Sun, پاییز: Leaf, زمستان: Snowflake, 'محیط کار': Briefcase, 'قرار عاشقانه': Heart, روزمره: CalendarDays, رسمی: Shirt, صبح: Sunrise, عصر: Sunset, شب: Moon };
const scenes = {
  seasons: { Icon: Leaf, hint: 'این عطر در هوای کدام فصل‌ها بیشتر به دل می‌نشیند؟' },
  occasions: { Icon: Briefcase, hint: 'این عطر را برای چه موقعیت‌هایی پیشنهاد می‌کنی؟' },
  dayTimes: { Icon: Sunrise, hint: 'از شروع روز تا آخر شب، چه زمانی برای این عطر مناسب‌تر است؟' },
};

export function UsageChoices({ label, value, options, onChange, disabled, scene }: {
  label: string; value: string; options: string[]; onChange: (value: string) => void; disabled?: boolean; scene?: UsageKey;
}) {
  const selected = splitUsage(value);
  const context = scene ? scenes[scene] : undefined;

  return <fieldset className="admin-usage" data-scene={scene}>
    <legend>{context && <context.Icon size={17} aria-hidden="true" />}{label}{!context && ' · انتخاب چند گزینه'}</legend>
    {context && <p className="admin-usage-context">{context.hint}</p>}
    <div>{options.map(name => {
      const Icon = icons[name as keyof typeof icons] ?? CalendarDays;
      const pressed = selected.includes(name);
      return <button key={name} type="button" disabled={disabled} aria-pressed={pressed}
        onClick={() => onChange((pressed ? selected.filter(option => option !== name) : [...selected, name]).join('، '))}>
        <Icon size={19} aria-hidden="true" />{name}
        {context && <Check className="admin-usage-check" size={15} aria-hidden="true" />}
      </button>;
    })}</div>
  </fieldset>;
}
