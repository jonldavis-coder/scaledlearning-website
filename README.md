# ScaledLearning website (example build)

Example/preview marketing site for **ScaledLearning** (scaledlearning.com), owner Jonathan Davis.

- Plain static HTML/CSS with a small amount of JS. No build step is needed to serve it.
- All products and prices are **example pricing**. Forms are placeholders with no backend.
- Buy/Subscribe buttons carry `data-checkout` keys (e.g. `magazine-single`, `magazine-annual`, `magazine-monthly`, `book-<slug>`, `book-<slug>-print`) and only open a "Checkout coming soon" notice. Swap their hrefs for Stripe Payment Links, Gumroad or Lemon Squeezy URLs before launch.
- Books: `books.html` plus one `book-<slug>.html` detail page per title. Covers live in `assets/books/` (WebP + thumbnail + JPG fallback). The Pink Flamingo Method uses the cover Jonathan supplied. The other 13 are composed from supplied photoreal artwork by `compose_ai_covers.py` in the build folder.
- Contains no testimonials, client logos, statistics or claimed credentials.
- Philosophy paraphrases John Hagel's published work on scalable learning, with links. ScaledLearning is not affiliated with John Hagel or Deloitte.

Preview: https://jonldavis-coder.github.io/scaledlearning-website/
