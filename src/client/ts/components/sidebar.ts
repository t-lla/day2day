import { loadComponent } from './loader.js';

let treeItems: HTMLLIElement[] = [];
let selectedIndex = 0;
let currentSection: string | null = null;


export async function initSidebar(): Promise<void> {
  await loadComponent("#sidebar", "../../components/sidebar.html");

  const treeSide = document.getElementById("treeSide");
  if (!treeSide) {
    console.error("Sidebar container (#treeSide) not found.");
    return;
  }
  treeItems = Array.from(treeSide.querySelectorAll("li")) as HTMLLIElement[];

  highlightSelection(selectedIndex);

  treeItems.forEach((item, index) => {
    item.addEventListener("click", () => {
      highlightSelection(index);
      const section = item.dataset.section;
      if (section) {
        loadSection(section);
      }
      if (!section) return;
      // if same section clciked twice, close
      if (currentSection === section) {

        const content = document.getElementById("content")!;
        content.innerHTML = "";
        content.classList.add("hidden");
        currentSection = null;
      } else { //open
        loadSection(section);
        currentSection = section;
      }
    });
    item.addEventListener("mouseover", () => {
      highlightSelection(index);
    });
  });
}

function highlightSelection(index: number): void {
  treeItems.forEach((item, i) => {
    item.classList.toggle("selected", i === index);
  });
  selectedIndex = index;
}

function loadSection(section: string): void {
  const content = document.getElementById("content");
  if (!content) return;

  const asciiArt = `
                               *#***#=                               
                              *::-==::*                              
                              *:--==-:*                              
                             #::-====::#                             
                             *:--==+=-:#                             
                            %::-======::%                            
                            . ======+== .                            
                           .             .                           
                           .             .                           
                          .           .   :                          
                         .            ..  ..                         
                         :            ..   :                         
                        *:: .         ... :=#                        
                        #:-=========+++*+=::%                        
                       %::===========++*+=-::%                       
                       %:-=+====-====++**+=::%                       
                      %::-==========+++***=-::%                      
                      %:-=+======-===+++**+=-:%                      
                     : ===+==========++****=-- :                     
                     : .::   =+=====++*+ ..::. :.                    
                    :  :::            .....::.  :                    
                   :: .::.            .....:::. ::                   
                   :  :::             .....:::.  :                   
                  -  .:::             .....::::. :-                  
                 +%:.:::              .....::::: :%+                 
             =+*+%::-=+*-             .....:=*+=-:+%+**=             
          ****+**%::=+**==============+++******==::%*++****          
      :*******++%.:-=+*=========-=====+++******+=-::%+********-      
   :************%::==**=========-=====++++******==::%**+*********:   
   #*********+++.:-=+**===============+++*******+=-::*+**********#   
   %%%=*********%===**==========-=====+++********===%*+*******+%%%   
    %%%%%+****++*###*-==========-=====++++*****-*###*+*****+%%%%%    
       #%%%##-**+***********:.         .:***********+*+-**#%%#       
          *##***:***********************************:#*****          
              **###*-***************************=#####*              
                 *#####.++*****************+*.%####*                 
                     ####%*=+++++++++++++=*%##%*                     
                        *#%%%% +==+===.%%%%#*                        
                           :#%##**+**##%#-                           
                               #**++*#                                                                                                                                     
    `;
  content.innerHTML = `<pre>${asciiArt}</pre><p>> ${section.toUpperCase()} selected.</p>`;
  content.classList.remove("hidden");
}


export function nextSidebarItem(): void {
  if (treeItems.length === 0) return;
  selectedIndex = (selectedIndex + 1) % treeItems.length;
  highlightSelection(selectedIndex);
}

export function prevSidebarItem(): void {
  if (treeItems.length === 0) return;
  selectedIndex = (selectedIndex - 1 + treeItems.length) % treeItems.length;
  highlightSelection(selectedIndex);
}

export function activateSidebarItem(): void {
  if (treeItems.length === 0) return;
  const item = treeItems[selectedIndex];
  const section = item.dataset.section;
  if (section) {
    loadSection(section);
  }
}
