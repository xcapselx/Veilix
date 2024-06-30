function navigateTo(url) {
    history.pushState(null, null, url);
    handleRoute();
  }
  
  function handleRoute() {
    const routes = {
      '/': renderHomePage,
      '/about': renderAboutPage,
      '/contact': renderContactPage,
    };
  
    const route = routes[window.location.pathname] || renderNotFoundPage;
    route();
  }
  
  function renderHomePage() {
    document.getElementById('app').innerHTML = '<h1>Home Page</h1>';
  }
  
  function renderAboutPage() {
    document.getElementById('app').innerHTML = '<h1>About Page</h1>';
  }
  
  function renderContactPage() {
    document.getElementById('app').innerHTML = '<h1>Contact Page</h1>';
  }
  
  function renderNotFoundPage() {
    document.getElementById('app').innerHTML = '<h1>404 - Page Not Found</h1>';
  }
  
  // Initial route handling
  window.addEventListener('popstate', handleRoute);
  handleRoute();
  
  // Export navigateTo for use in other files
  export { navigateTo };
  