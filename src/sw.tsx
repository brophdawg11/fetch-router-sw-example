import {
  createRouter,
  html,
  route,
  type Middleware,
  type RouteHandlers,
} from "@remix-run/fetch-router";
import { type Remix } from "@remix-run/dom";
import { renderToString } from "@remix-run/dom/server";

// Define some routes
let routes = route({
  index: "/",
  about: "/about",
  notFound: "*notfound",
});

// Setup proper TS typings for the service worker - see:
// https://www.devextent.com/create-service-worker-typescript/
/// <reference lib="WebWorker" />
// export empty type because of tsc --isolatedModules flag
export type {};
declare const self: ServiceWorkerGlobalScope;

// And some handlers returning Remix Components
let handlers: RouteHandlers<typeof routes> = {
  index: ({ request }) => renderHtml(request.url, Home),
  about: ({ request }) => renderHtml(request.url, About),
  notFound: ({ request }) => renderHtml(request.url, NotFound),
};

// Define per-route layouts
let layouts: Record<
  keyof typeof routes,
  Remix.Component<Remix.NoContext, { children: Remix.RemixElement | null }>
> = {
  index: Layout,
  about: Layout,
  notFound: Layout404,
};

// Log navigations to the console
const logger: Middleware = async ({ request }, next) => {
  console.log("➡️ Navigate:", request.url);
  await next();
  console.log("✅ Navigate:", request.url);
};

// Create a router and add our middleware
let router = createRouter();
router.use(logger);
router.map(routes, handlers);

self.addEventListener("fetch", async (event) => {
  let { request } = event;
  if (request.url.split("/").slice(-1)[0].includes(".")) {
    return;
  }
  console.log(`URL serving from service worker: ${request.url}`);
  event.respondWith(router.fetch(request));
});

// Default UI layout for routes
function Layout(
  this: Remix.Handle,
  { children }: { children: Remix.RemixElement | null }
) {
  return (
    <>
      <Nav />
      {/* <PendingNavigationIndicator /> */}
      {children}
    </>
  );
}

// Separate UI layout for 404 routes
function Layout404(
  this: Remix.Handle,
  { children }: { children: Remix.RemixElement | null }
) {
  return (
    <>
      <h1>Oh no!</h1>
      <p>(We're using a different UI layout for 404 routes)</p>
      {children}
    </>
  );
}

function Nav() {
  return (
    <nav>
      <ul>
        <li>
          <a href="/">Home</a>
        </li>
        <li>
          <a href="/about">/about</a>
        </li>
        <li>
          <a href="/junk">/junk (404)</a>
        </li>
      </ul>
    </nav>
  );
}

function Home() {
  return <h1>Home</h1>;
}

function About() {
  return <h1>About</h1>;
}

function NotFound() {
  return (
    <>
      <p>404 Not Found</p>
      <a href="/">Go back home</a>
    </>
  );
}

async function renderHtml(url: string, Component: Remix.Component) {
  await new Promise((r) => setTimeout(r, 1000));
  let LayoutComponent = getLayout(new URL(url));
  return html(
    await renderToString(
      <Document>
        <LayoutComponent>
          <Component />
        </LayoutComponent>
      </Document>
    )
  );
}

function getLayout(
  url: URL
): Remix.Component<Remix.NoContext, { children: Remix.RemixElement | null }> {
  for (let key of Object.keys(routes) as (keyof typeof routes)[]) {
    let path = routes[key];
    if (path.pattern.test(url.toString())) {
      return layouts[key];
    }
  }
  return Layout404;
}

function Document({ children }: { children: Remix.RemixElement | null }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>temp</title>
      </head>
      <body>
        <div id="app">{children}</div>
      </body>
    </html>
  );
}
