const Router = {
  init: () => {
    document.querySelectorAll("a.navlink").forEach((a) => {
      a.addEventListener("click", (event) => {
        event.preventDefault();
        const url = event.target.getAttribute("href");
        Router.go(url);
      });
    });

    // Event Handler for URL changes
    window.addEventListener("popstate", (event) => {
      if (event.state && event.state.route) {
        Router.go(event.state.route, false);
      } else {
        Router.go(location.pathname, false);
      }
    });

    // Check the initial URL
    Router.go(location.pathname, false);
  },

  go: async (route, addToHistory = true) => {
    console.log(`Going to ${route}`);

    if (addToHistory) {
      history.pushState({ route }, "", route);
    }

    let pageElement = null;
    switch (route) {
      case "/":
        pageElement = document.createElement("menu-page");
        break;

      case "/order":
        pageElement = document.createElement("order-page");
        break;

      default:
        if (route.startsWith("/product-")) {
          pageElement = document.createElement("details-page");
          const paramId = route.substring(route.lastIndexOf("-") + 1);
          pageElement.dataset.productId = paramId;
        }
    }

    if (pageElement) {
      function changePage() {
        const cache = document.querySelector("main");
        cache.innerHTML = ""; // Clear current content
        cache.appendChild(pageElement); // Append new content
        window.scrollTo(0, 0); // Reset scroll position
      }

      if (document.startViewTransition) {
        try {
          document.startViewTransition(changePage);
        } catch (error) {
          console.warn(
            "View Transition API failed. Falling back to normal rendering.",
            error
          );
          changePage();
        }
      } else {
        changePage();
      }
    } else {
      // Handle 404
      document.querySelector("main").innerHTML = "Oops, 404! Page not found.";
    }
  },
};

export default Router;
