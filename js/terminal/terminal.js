import { applyTheme } from "../config/settings.js";
import { banner, moo, about, help, rmrf, test, githubURL } from "../config/content.js";
import { scrollToBottom } from '../handlers/utils.js';

export async function showWelcomeMessage() {
	const terminalOutput = document.getElementById("terminal-output");
	const welcomeMessage = banner;
	const newOutputLine = document.createElement("div");
	terminalOutput.appendChild(newOutputLine);
	await animateText(newOutputLine, welcomeMessage);
	scrollToBottom();
}

export function processCommand(inputText) {
	const inputPrefix = document.getElementById("input-prefix");
	const terminalInput = document.getElementById("terminal-input");
	const userCommand = terminalInput.textContent;
	let response = '';
    let inputWords = inputText.split(" ")
	switch (inputWords[0].toLowerCase()) {
	  case "help":
		return userCommand + "\n" + help;
      case "foo":
            if((inputWords[1]||"").toLowerCase()=="bar") inputWords[1]="baz"
		return userCommand + "\n" + (inputWords[1]||"bar");
      case "overscan":
            setOverscan( parseInt(inputWords[1])||10 )
        break;
      case "rm":
            if((inputWords[1]||0)=="-rf" && (inputWords[2]||0)=="*"){
                if((inputWords[3]||0)=="--no-preserve-root"){
                    distort(0.1,5000,false)
                    distort(100,40000,false)
                    return ""
                }
                return userCommand + "\n" + rmrf;
            }
            return userCommand + "\n" + inputWords[0]+" is for people, not cows"
        break;
      case "echo":
        inputWords.shift();
		return userCommand + "\n" + inputWords.join(" ");
      case "ls":
      case "cd":
      case "mv":
      case "mkdir":
		return userCommand + "\n" + inputWords[0]+" is for people, not cows"
      case "whoami":
		return userCommand + "\n" + "you are a good cow."
      case "cat":
		return userCommand + "\n" + "not cat, cow."
	  case "date":
		return userCommand + "\n" + new Date().toLocaleString();
	  case "clear":
		document.getElementById("terminal-output").innerHTML = "";
		return "nice and blank";
	  case "about":
		return userCommand + "\n" + about;
	  case "moo":
	  case "cow":
        distort(0.6,25000)
		return userCommand + "\n" + moo;
	  case "github":
		window.open(githubURL, "_blank");
		break;
	  case "motd":
		return userCommand + "\n" + banner;
	  case "test":
		return userCommand + "\n" + test;
	  default:
		return userCommand + "\n" + `Unknown command: ${inputText}`;
	}
	return response;
}

let userInteracted = false;
document.addEventListener("click", () => {
	userInteracted = true;
});
  
export async function animateText(element, text, delay = 10, terminalInput, inputPrefix) {
	if (terminalInput) {
		terminalInput.contentEditable = "false";
		if (inputPrefix) inputPrefix.style.display = "none";
	}

	// const typingSound = new Audio("sounds/typing.mp3");

	// Calculate speed factor based on character count
	const speedFactor = text.length <= 50 ? 1 : text.length <= 100 ? 10 : 20;
	const adjustedDelay = delay / speedFactor;

	for (const char of text) {
		element.textContent += char;
		scrollToBottom();

		if (userInteracted) {
		// Play typing sound
		// typingSound.currentTime = 0;
		// typingSound.play().catch((error) => {
		//   console.error("Error playing typing sound:", error);
		// });

		}

		await new Promise((resolve) => setTimeout(resolve, adjustedDelay));
	}

	if (terminalInput) {
		terminalInput.contentEditable = "true";
		if (inputPrefix) inputPrefix.style.display = "inline";
	}
}
