let currentSection = null;
let selectedIndex = 0;
const treeItems = Array.from(document.querySelectorAll("#treeNav li"));

function mainMenu() {
    document.getElementById('portalScreen').classList.remove('hidden');
    document.getElementById('content').classList.add('hidden');
    currentSection = null;
}

function navigateToApp() {
    document.getElementById('portalScreen').classList.add('hidden');
    document.getElementById('content').classList.remove('hidden');

    if (currentSection === null) {
        document.getElementById('content').innerHTML = 
        `<p>> now what? </p>`;
    }
}

function loadSection(section) {
    const content = document.getElementById('content');

    if (currentSection === section) {
        return;
    }

    const ascii = `
        
                                        
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

    content.innerHTML = `<pre>${ascii}</pre><p>> ${section.toUpperCase()} selected.</p>`;
    content.classList.remove('hidden');
    currentSection = section;
}


function highlightSelection(index) {
    treeItems.forEach((item, i) => {
        item.classList.toggle("selected", i === index);
    });
    selectedIndex = index;
}

highlightSelection(selectedIndex);


document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
        selectedIndex = (selectedIndex + 1) % treeItems.length;
        highlightSelection(selectedIndex);
    } else if (e.key === "ArrowUp") {
        selectedIndex = (selectedIndex - 1 + treeItems.length) % treeItems.length;
        highlightSelection(selectedIndex);
    } else if (e.key === "Enter") {
        const selectedItem = treeItems[selectedIndex];
        const section = selectedItem.dataset.section;
        loadSection(section);
    }
});


treeItems.forEach((item, index) => {
    item.addEventListener("click", () => {
        highlightSelection(index);
        const section = item.dataset.section;
        loadSection(section);
    });

    item.addEventListener("mouseover", () => {
        highlightSelection(index);
    });
});
