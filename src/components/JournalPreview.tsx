import { useLayoutEffect, useRef, useState } from 'react';
import { ArrowUpLeft } from 'lucide-react';
import { articles } from '../data/homepage';
import { SectionHeading } from './SharedUI';

const journalImages = [
  'how-to-read-notes.png',
  'EDP-or-EDT.png',
  'why-to-test-before-purchase.png',
];

function JournalCard({ article, index }: { article: (typeof articles)[number]; index: number }) {
  const [flipped, setFlipped] = useState(false);
  const frontButton = useRef<HTMLButtonElement>(null);
  const journalLink = useRef<HTMLAnchorElement>(null);
  const shouldMoveFocus = useRef(false);

  useLayoutEffect(() => {
    if (shouldMoveFocus.current) {
      (flipped ? journalLink : frontButton).current?.focus({ preventScroll: true });
      shouldMoveFocus.current = false;
    }
  }, [flipped]);

  function flip() {
    shouldMoveFocus.current = true;
    setFlipped(!flipped);
  }

  return <article className="journal-flip" data-flipped={flipped}>
    <button className="journal-card journal-front" type="button" ref={frontButton}
      aria-hidden={flipped} tabIndex={flipped ? -1 : 0} onClick={flip}>
      <span className={'journal-art journal-art-' + index}>
        <img src={`${import.meta.env.BASE_URL}images/journal/${journalImages[index]}`} alt="" loading="lazy" decoding="async" />
      </span>
      <span className="journal-copy">
        <span className="eyebrow">{article.category}</span>
        <span className="journal-title">{article.title}</span>
      </span>
    </button>
    <div className="journal-back" aria-hidden={!flipped} onClick={flip}>
      <div className="journal-back-heading">
        <span className="eyebrow">{article.category}</span>
        <h3 className="journal-title">{article.title}</h3>
      </div>
      <p>{article.text}</p>
      <a className="cta journal-link" href="#/journal" ref={journalLink} tabIndex={flipped ? 0 : -1}
        onClick={event => event.stopPropagation()}
        onKeyDown={event => {
          if (event.key === 'Escape') flip();
        }}>
        رفتن به مجلهٔ آروما <ArrowUpLeft aria-hidden="true" size={16} />
      </a>
    </div>
  </article>;
}

export function JournalPreview() {
  return <section id="journal" className="section container">
    <SectionHeading eyebrow="THE AROMA JOURNAL" title="کمی بیشتر از عطر بدانیم" />
    <div className="journal-grid">
      {articles.map((article, index) => <JournalCard key={article.title} article={article} index={index} />)}
    </div>
  </section>;
}
