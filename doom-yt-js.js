document.addEventListener('DOMContentLoaded', function () {
(function() {
  // 1. ConfiguraÃ§Ã£o do container
  const container = document.querySelector('.photographer-page');

  if (!container) {
    console.error("Container de comentÃ¡rio nÃ£o encontrado!");
    return;
  }

  // Bloqueia o scroll da pÃ¡gina para evitar que as teclas de seta rolem o documento
  document.body.style.overflow = 'hidden';
  window.addEventListener('keydown', function(e) {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault();
    }
  }, { passive: false });

  // Define alguns estilos bÃ¡sicos para o container
  container.style.backgroundColor = 'black';
  container.style.color = 'white';
  container.style.fontFamily = 'monospace';
  container.style.whiteSpace = 'pre';
  container.style.padding = '5px';
  container.style.display = 'block';


const page = document.querySelector('body');
page.style.overflow = 'auto';

  // 2. Ajusta dinamicamente o tamanho do container conforme a janela do usuÃ¡rio
  const maxGameWidth = 800;
  const maxGameHeight = 500;
  // Define o tamanho do jogo: usa o mÃ­nimo entre o mÃ¡ximo desejado e a janela (com uma margem)
  const gameWidth = Math.min(maxGameWidth, window.innerWidth - 20);
  const gameHeight = Math.min(maxGameHeight, window.innerHeight - 20);
  container.style.width = gameWidth + "px";
  container.style.height = gameHeight + "px";
container.style.height = '800px';

  // Limpa o conteÃºdo atual (evitando innerHTML para nÃ£o disparar problemas de TrustedHTML)
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  // 3. Define a resoluÃ§Ã£o em caracteres, baseado em uma estimativa do tamanho de cada caractere
  const charWidth = 16;   // largura estimada de um caractere (em pixels)
  const charHeight = 32; // altura estimada de um caractere (em pixels)
  const screenWidth = Math.floor(gameWidth / charWidth);
  const screenHeight = Math.floor(gameHeight / charHeight);

  // 4. ParÃ¢metros e dados do jogo
  const wallShades = ['\u2588','\u2588','\u2593','\u2593','\u2592','\u2592','\u2591','\u2591','.',' '];
  const floorShades = ['@','%','#','*','+','=','-','.',' '];
  const ceilingShades = [' ','.','-', '=', '#','%','@'];

  const mapWidth = 16;
  const mapHeight = 16;
  const map = [
    "################",
    "#..............#",
    "#..............#",
    "#...##...##....#",
    "#...##...##....#",
    "#..............#",
    "#..............#",
    "#..............#",
    "#..............#",
    "#..............#",
    "#...#######....#",
    "#..............#",
    "#..............#",
    "#..............#",
    "#..............#",
    "################"
  ];

  // Estado inicial do jogador
  let playerX = 8;
  let playerY = 8;
  let playerAngle = 0;         // em radianos
  const fov = Math.PI / 4;     // campo de visÃ£o de 45Â°
  const depth = 16;            // distÃ¢ncia mÃ¡xima de renderizaÃ§Ã£o

  // VariÃ¡veis para cÃ¡lculo de FPS (opcional)
  let lastTime = performance.now();
  let fps = 0;

  // Objeto para controle das teclas pressionadas
  const keys = {};
  window.addEventListener('keydown', (e) => { keys[e.key] = true; });
  window.addEventListener('keyup', (e) => { keys[e.key] = false; });

  // 5. Loop principal do jogo (raycasting e renderizaÃ§Ã£o)
  function gameLoop() {
    const now = performance.now();
    const elapsed = now - lastTime;
    lastTime = now;
    fps = Math.round(1000 / elapsed);

    // Atualiza posiÃ§Ã£o e rotaÃ§Ã£o do jogador
    const moveSpeed = 0.1;
    const rotSpeed = 0.05;
    if (keys["ArrowLeft"])  playerAngle -= rotSpeed;
    if (keys["ArrowRight"]) playerAngle += rotSpeed;
    if (keys["ArrowUp"]) {
      const newX = playerX + Math.cos(playerAngle) * moveSpeed;
      const newY = playerY + Math.sin(playerAngle) * moveSpeed;
      if (map[Math.floor(newY)][Math.floor(newX)] !== '#') {
        playerX = newX;
        playerY = newY;
      }
    }
    if (keys["ArrowDown"]) {
      const newX = playerX - Math.cos(playerAngle) * moveSpeed;
      const newY = playerY - Math.sin(playerAngle) * moveSpeed;
      if (map[Math.floor(newY)][Math.floor(newX)] !== '#') {
        playerX = newX;
        playerY = newY;
      }
    }

    let output = "";

    // RenderizaÃ§Ã£o da cena com raycasting (para cada coluna)
    for (let y = 0; y < screenHeight; y++) {
      for (let x = 0; x < screenWidth; x++) {
        // Calcula o Ã¢ngulo do raio para a coluna atual
        const rayAngle = (playerAngle - fov / 2) + (x / screenWidth) * fov;
        let distanceToWall = 0;
        let hitWall = false;
        let boundary = false;  // Para acentuar bordas

        const eyeX = Math.cos(rayAngle);
        const eyeY = Math.sin(rayAngle);

        // AvanÃ§a o raio atÃ© bater em uma parede ou atingir a distÃ¢ncia mÃ¡xima
        while (!hitWall && distanceToWall < depth) {
          distanceToWall += 0.05;
          const testX = Math.floor(playerX + eyeX * distanceToWall);
          const testY = Math.floor(playerY + eyeY * distanceToWall);
          if (testX < 0 || testX >= mapWidth || testY < 0 || testY >= mapHeight) {
            hitWall = true;
            distanceToWall = depth;
          } else {
            if (map[testY][testX] === '#') {
              hitWall = true;
              // Verifica bordas para efeito de contorno
              let p = [];
              for (let tx = 0; tx < 2; tx++) {
                for (let ty = 0; ty < 2; ty++) {
                  const vx = (testX + tx) - playerX;
                  const vy = (testY + ty) - playerY;
                  const d = Math.sqrt(vx * vx + vy * vy);
                  const dot = (eyeX * vx / d) + (eyeY * vy / d);
                  p.push([d, dot]);
                }
              }
              p.sort((a, b) => a[0] - b[0]);
              const boundAngle = 0.01;
              if (Math.acos(p[0][1]) < boundAngle) {
                boundary = true;
              }
            }
          }
        }

        let pixel = ' ';
        // Determina onde comeÃ§a o teto e o chÃ£o nesta coluna
        const ceiling = Math.floor(screenHeight / 2 - screenHeight / distanceToWall);
        const floorLine = screenHeight - ceiling;

        if (y < ceiling) {
          // Teto: aplica um degradÃª usando ceilingShades
          const t = y / ceiling;
          let shadeIndex = Math.floor(t * ceilingShades.length);
          if (shadeIndex < 0) shadeIndex = 0;
          if (shadeIndex >= ceilingShades.length) shadeIndex = ceilingShades.length - 1;
          pixel = ceilingShades[shadeIndex];
        } else if (y >= ceiling && y <= floorLine) {
          // Parede: usa sombreamento baseado na distÃ¢ncia e verifica contornos
          if (boundary) {
            pixel = '|';
          } else {
            const ratio = distanceToWall / depth;
            let shadeIndex = Math.floor(ratio * wallShades.length);
            if (shadeIndex < 0) shadeIndex = 0;
            if (shadeIndex >= wallShades.length) shadeIndex = wallShades.length - 1;
            pixel = wallShades[shadeIndex];
          }
        } else {
          // ChÃ£o: aplica sombreamento conforme a distÃ¢ncia
          const b = 1 - ((y - screenHeight / 2) / (screenHeight / 2));
          let floorIndex = Math.floor(b * floorShades.length);
          if (floorIndex < 0) floorIndex = 0;
          if (floorIndex >= floorShades.length) floorIndex = floorShades.length - 1;
          pixel = floorShades[floorIndex];
        }
        output += pixel;
      }
      output += "\n";
    }

    // 6. HUD e Minimapa
    let hud = "";
    hud += "ASCII DOOM  |  FPS: " + fps + "\n";
    hud += "PosiÃ§Ã£o: (" + playerX.toFixed(2) + ", " + playerY.toFixed(2) + ") | Ã‚ngulo: " + (playerAngle * (180/Math.PI)).toFixed(2) + "Â°\n\n";
    hud += "MINIMAPA:\n";
    for (let my = 0; my < mapHeight; my++) {
      let line = "";
      for (let mx = 0; mx < mapWidth; mx++) {
        if (Math.floor(playerY) === my && Math.floor(playerX) === mx) {
          if (playerAngle >= -0.5 && playerAngle < 0.5) line += ">";
          else if (playerAngle >= 0.5 && playerAngle < 1.5) line += "v";
          else if (playerAngle >= -1.5 && playerAngle < -0.5) line += "^";
          else line += "<";
        } else {
          line += map[my][mx];
        }
      }
      hud += line + "\n";
    }
    output = hud + "\n" + output;

    // Atualiza o container com o frame renderizado
    container.textContent = output;

    requestAnimationFrame(gameLoop);
  }

  // Inicia o loop do jogo
  gameLoop();
})();
});
