# ScaledLearning website (example build)

Example/preview marketing site for **ScaledLearning** (scaledlearning.com), owner Jonathan Davis.

- Plain static HTML/CSS with a small amount of JS. No build step is needed to serve it.
- All products and prices are **example pricing**. Forms are placeholders with no backend.
- Buy/Subscribe buttons carry `data-checkout` keys (e.g. `magazine-single`, `magazine-annual`, `magazine-monthly`, `book-<slug>`, `book-<slug>-print`) and only open a "Checkout coming soon" notice. Swap their hrefs for Stripe Payment Links, Gumroad or Lemon Squeezy URLs before launch.
- Books: `books.html` plus one `book-<slug>.html` detail page per title. Covers are illustrated inline SVG, except The Pink Flamingo Method, which uses the supplied cover (`assets/books/`).
- Contains no testimonials, client logos, statistics or claimed credentials.
- Philosophy paraphrases John Hagel's published work on scalable learning, with links. ScaledLearning is not affiliated with John Hagel or Deloitte.

Preview: https://jonldavis-coder.github.io/scaledlearning-website/
