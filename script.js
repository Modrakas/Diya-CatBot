const messageBody = document.querySelector('.message-body');
const messageInput = document.querySelector('.message-input');
const sendMessageButton = document.querySelector('#send-message');

//API setup
const API_KEY = 'AIzaSyAkD3-q8Jwc9D3KiblnRaT8OAgMXFUCuAI';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

const userData = {
	message: null
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
	//API request
	const requestOptions = {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({
			contents: [{
				parts: [{ text: userData.message }]
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
		console.log(error); 
	} finally {
		incomingMessageDiv.classList.remove('thinking');
		messageBody.scrollTo({ top: messageBody.scrollHeight, behavio: 'smooth' }); 
	}
};

//outgoing user message function
const outgoingMessage = (event) => {
	event.preventDefault();
	userData.message = messageInput.value.trim();
	messageInput.value = '';

	// create and display user message
	const messageContent = `<div class="message-text"></div>`;

	const outgoingMessageDiv = createMessageElement(messageContent, 'user-message');
	outgoingMessageDiv.querySelector('.message-text').textContent = userData.message;
	messageBody.appendChild(outgoingMessageDiv);
	messageBody.scrollTo({ top: messageBody.scrollHeight, behavio: 'smooth' }); 
	
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
		messageBody.scrollTo({ top: messageBody.scrollHeight, behavio: 'smooth' }); 
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

sendMessageButton.addEventListener('click', (event) => outgoingMessage(event));