// Diagnose interrupted/missing modules instead of leaving an empty store shell.
// The actual homepage and catalog are always rendered by the application.
import('./main.js').catch((error) => {
  console.error('No se ha podido iniciar Angels Joyería:', error);
  const main = document.querySelector('#contenido');
  main.replaceChildren();
  const section = document.createElement('section');
  section.className = 'info-page wrap';
  section.setAttribute('role', 'alert');
  const heading = document.createElement('h1');
  heading.textContent = 'No pudimos abrir la tienda.';
  const message = document.createElement('p');
  message.textContent = 'No se ha podido cargar la página. Comprueba tu conexión y vuelve a intentarlo.';
  const retry = document.createElement('button');
  retry.className = 'button button-primary';
  retry.textContent = 'Volver a intentar';
  retry.addEventListener('click', () => location.reload());
  section.append(heading, message, retry);
  main.append(section);
});
