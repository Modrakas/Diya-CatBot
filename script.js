const messageBody = document.querySelector('.message-body');
const messageInput = document.querySelector('.message-input');
const sendMessageButton = document.querySelector('#send-message');
const fileUpload = document.querySelector('#file-upload');

//API setup
const API_KEY = 'AIzaSyAkD3-q8Jwc9D3KiblnRaT8OAgMXFUCuAI';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;



const userData = {
	message: null,
	file: {
		data: null,
		mime_type: null
	}
}

//create div and class
const createMessageElement = (content, ...classes) => {
	const div = document.createElement('div');
	div.classList.add('message', ...classes);
	div.innerHTML = content;
	return div;
}

//Generate catbot response using API
const generateCatbotResponse = async (incomingMessageDiv) => {
	const messageElement = incomingMessageDiv.querySelector('.message-text');
	const catbotName = 'Diya';

		// Check if the user asks for the catbot's name
		if (userData.message.toLowerCase().includes('your name')) {
			messageElement.innerText = `I'm a helpful assistant named '${catbotName}'.`;
			incomingMessageDiv.classList.remove('thinking');
			messageBody.scrollTo({ top: messageBody.scrollHeight, behavior: 'smooth' });
			return;
		}

	//API request
	const requestOptions = {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({
			contents: [{
				parts: [{ text: userData.message }, ...(userData.file.data ? [{ inline_data: userData.file }] : [])]
			}]
		})
	}
	try {
		//Fetch response frpm API
		const response = await fetch(API_URL, requestOptions);
		const data = await response.json();
		if(!response.ok) throw new Error(data.error.message);

		//retrieve and display catbot response text
	const apiResponseText = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, '$1').trim();
		messageElement.innerText = apiResponseText;
	} catch (error){
		//Generate API error response
		console.log(error);
		messageElement.innerText = 'Sorry, something went wrong. Please try again.'
	} finally {
		//Reset user data, remove thinking indicator, and auto scroll to bottom
		userData.file = {};
		incomingMessageDiv.classList.remove('thinking');
		messageBody.scrollTo({ top: messageBody.scrollHeight, behavior: 'smooth' }); 
	}
};

//outgoing user message function
const outgoingMessage = (event) => {
	event.preventDefault();
	userData.message = messageInput.value.trim();
	messageInput.value = '';

	// create and display user message
	const messageContent = `<div class="message-text"></div> ${userData.file.data ? `<img src='data:${userData.file.mime_type};base64,${userData.file.data}' class='attachment'/>` : ''}`;

	const outgoingMessageDiv = createMessageElement(messageContent, 'user-message');
	outgoingMessageDiv.querySelector('.message-text').textContent = userData.message;
	messageBody.appendChild(outgoingMessageDiv);
	messageBody.scrollTo({ top: messageBody.scrollHeight, behavior: 'smooth' }); 
	
	//Simulate catbot response with thinking indicator after a delay
	setTimeout(() => {
		const messageContent = `<i class="fa-solid fa-cat catbot-avatar"></i>
		<div class="message-text">
			<div class="thinking-indicator">
				<div class="dot"></div>
				<div class="dot"></div>
				<div class="dot"></div>
			</div>
			
		</div>`;
	
		const incomingMessageDiv = createMessageElement(messageContent, 'catbot-message', 'thinking');
		messageBody.appendChild(incomingMessageDiv);
		messageBody.scrollTo({ top: messageBody.scrollHeight, behavior: 'smooth' }); 
		generateCatbotResponse(incomingMessageDiv);
	}, 600);
}

//send message when 'enter' key is used
messageInput.addEventListener('keydown', (event) => {
	const userMessage = event.target.value.trim();
	if(event.key === 'Enter' && userMessage) {
		outgoingMessage(event);
	}
});

//Recieve file input
fileUpload.addEventListener('change', () => {
	const file = fileUpload.files[0];
	if(!file) return;

	//Convert file to base64 format so HTTP requests can read the plain text of file
	const reader = new FileReader();
	reader.onload = (event) => {
		const base64String = event.target.result.split(',')[1];

		//Stores file data in userData
		userData.file = {
			data: base64String,
			mime_type: file.type
		}
		
		//Clear file upload value so same file can be uploaded again
		fileUpload.value = '';
	}
	reader.readAsDataURL(file);
});

//BUTTONS SENDING DATA TO CATBOT
sendMessageButton.addEventListener('click', (event) => outgoingMessage(event));
//Trigger file upload when the upload button is clicked
document.querySelector('#file-upload-btn').addEventListener('click', () => fileUpload.click());