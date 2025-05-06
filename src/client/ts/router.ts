/**
 * @packageDocumentation
 * @module Router
 *
 * Provides navigation logic for displaying sections of the application,
 * handling portal visibility and formatting dates.
 */
import { initNotes } from "./components/notes/notes.controller.js";
import { initTasks } from "./components/tasks/tasks.controller.js";
import { initHabits } from "./components/habits/habits.controller.js";
import { setPortalVisible } from "./components/sidebar/sidebar.controller.js";

let portalVisible = true;

/**
 * Displays the main menu by showing the portal screen and hiding any other content.
 * Resets portal visibility state to the intro screen.
 */
export function showMainMenu(): void {
  const portal = document.getElementById("portalScreen");
  const content = document.getElementById("content");
  if (portal) {
    portal.classList.remove("hidden");
  }
  if (content) {
    content.classList.add("hidden");
    content.innerHTML = "";
  }
  portalVisible = true;
  setPortalVisible(true);
}

/**
 * Hides the portal screen and shows content. If content is empty, displays a placeholder message.
 * Updates portal visibility state.
 */
export function navigateToApp(): void {
  const portal = document.getElementById("portalScreen");
  const content = document.getElementById("content");
  if (portal) {
    portal.classList.add("hidden");
  }
  if (content) {
    content.classList.remove("hidden");
    if (!content.innerHTML.trim()) {
      content.innerHTML = `<p>> now what? </p>`;
    }
  }
  portalVisible = false;
  setPortalVisible(false);
}

/**
 * Placeholder for router initialization logic.
 */
export function initRouter(): void {}

/**
 * Loads sections by name.
 * - "notes": initializes the notes feature
 * - "tasks": initializes the tasks feature
 * - "habits": initializes the habits feature
 * - default: displays ascii art and selection message
 *
 * @param section Identifier of the section to load.
 * @throws Will throw an error if the content element is not found.
 * @example
 * loadSection('tasks');
 */
export function loadSection(section: string): void {
  const content = document.getElementById("content");
  if (!content) 
    throw new Error("Content container not found");

  switch (section) {
    case "notes":
      initNotes();
      break;
    case "tasks":
      initTasks();
      break;
    case "habits":
      initHabits();
      break;
    default:
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
                      %:-=+======-===+++**+=-:%%
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
  }

  content.classList.remove("hidden");
}

/**
 * Formats a Date object into a DD/MM/YYYY string.
 *
 * @param date - The Date object to format.
 * @returns A formatted date string in DD/MM/YYYY format.
 * @example
 * const date = new Date('2025-05-03');
 * console.log(formatDate(date)); // '03/05/2025'
 */
export function formatDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}