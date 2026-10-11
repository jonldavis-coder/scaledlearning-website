# ScaledLearning website (example build)

Example/preview marketing site for **ScaledLearning** (scaledlearning.com), owner Jonathan Davis.

- Plain static HTML/CSS with a small amount of JS. No build step is needed to serve it.
- Prices shown are the actual list prices (USD). Checkout is not connected yet (buttons show "Checkout coming soon"). Forms are placeholders with no backend.
- Buy/Subscribe buttons carry `data-checkout` keys (e.g. `magazine-single`, `magazine-annual`, `magazine-monthly`, `book-<slug>`, `book-<slug>-print`) and only open a "Checkout coming soon" notice. Swap their hrefs for Stripe Payment Links, Gumroad or Lemon Squeezy URLs before launch.
- Books: `books.html` plus one `book-<slug>.html` detail page per title. Covers live in `assets/books/` (WebP + thumbnail + JPG fallback). The Pink Flamingo Method uses the cover Jonathan supplied. The other 13 are composed from supplied photoreal artwork by `compose_ai_covers.py` in the build folder.
- Contains no testimonials, client logos, statistics or claimed credentials.
- Philosophy paraphrases John Hagel's published work on scalable learning, with links. ScaledLearning is not affiliated with John Hagel or Deloitte.

Preview: https://jonldavis-coder.github.io/scaledlearning-website/

## Newsletter and print back-orders (example build)
- `newsletter.html`: the free monthly Scaled Learning Brief. A compact signup band sits in the footer of every page, and the header has a "Free newsletter" button. All signup forms are placeholders (no backend, honeypot field).
- Print Buy buttons (`data-print="book-<slug>-print"`) link to `backorder.html?book=<slug>` (noindex), which reads the slug, shows the cover, title and eBook price, and links to `book-<slug>.html#buy-ebook`. eBook buttons still use the placeholder checkout (`data-checkout`).
