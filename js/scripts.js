$(document).ready(function() {
  var firebaseConfig = {
		apiKey: "AIzaSyD5WPrxLPtaJfCju56pxhu6r8sGYDn7tc8",
		authDomain: "nino-ff8f0.firebaseapp.com",
		databaseURL: "https://nino-ff8f0-default-rtdb.firebaseio.com",
		projectId: "nino-ff8f0",
		storageBucket: "nino-ff8f0.appspot.com",
		messagingSenderId: "190961029360",
		appId: "1:190961029360:web:3a3dec27adeba2685fb235"
	};

	// Initialize Firebase
	firebase.initializeApp(firebaseConfig);

	var chat = $('#chatButton');
	var no = $('#noButton');
	var txt = $('#textBox');
	var help = $('#helpBox');
	var helpBtn = $('#helpButton');
	var trainingArea = $('#trainArea');

	var botTalk = [];

	firebase.database().ref('botTalk').on('value', function(snapshot) {
		botTalk = [];
		snapshot.forEach(function(childSnapshot) {
			var childData = childSnapshot.val();
			botTalk.push(childData);
		});

		console.log(botTalk)
	});

	//***********Machine learning**************
	var net = new brain.NeuralNetwork();
	var trainData = [];
	var maxLength = 0;
	var remainingLength = 0;
	var newInput;

	firebase.database().ref('trainData').on('value', function(snapshot) {
		trainData = [];
		snapshot.forEach(function(childSnapshot) {
			var childData = childSnapshot.val();
			console.log('childata antes do push', childData)
			trainData.push(childData);
		});

		console.log(trainData)
		console.log('length do bottalk dentro do traindata', botTalk.length)
	
		//Commands to fill up the arrays with zeros. All arrays must be of same length
		for (j=0;j<trainData.length;j++){
			if (trainData[j].input.length > maxLength){
				maxLength = trainData[j].input.length;
			}
		}
		for (q=0;q<trainData.length;q++){
			if (trainData[q].input.length < maxLength){
				remainingLength = maxLength - trainData[q].input.length;
				zeroArray = Array(remainingLength).fill(0);
				trainData[q].input = trainData[q].input.concat(zeroArray);
			}
		}
	
		//Training
		net.train(trainData, {
			log: false,
			logPeriod: 10,
			errorThresh: 0.0005,
		}); //Using all the training data to train the AI
	});

	var message_side = 'left';

	function sendMessage(text) {
		txt.val('');
		var messages = $('.messages');

		message_side = message_side === 'left' ? 'right' : 'left';

		var message = $($(".message_template").clone().html());
		
		message.addClass(message_side).find('.text').html(text);
		$('.messages').append(message);
		message.addClass('appeared');

		messages.animate({ scrollTop: messages.prop('scrollHeight') }, 300);
	};

	var inputData;

	$(".send_message").click(function (e) {
		if (txt.val() != ''){
			inputData = textToBinary(txt.val());
			sendMessage(txt.val());
			var result = brain.likely(inputData, net);
			for (k=1;k<=botTalk.length;k++){
				if (result == k){
					delayVar=k;
					setTimeout(function(){
						sendMessage(botTalk[delayVar-1]);
					},800);
				}
			}
		}
	});
	$(".message_input").keyup(function (e) {
		if (e.which === 13) {
			if (txt.val() != ""){
				inputData = textToBinary(txt.val());
				sendMessage(txt.val());
				var result = brain.likely(inputData, net);
				for (k=1;k<=botTalk.length;k++){
					if (result == k){
						delayVar=k;
						setTimeout(function(){
							sendMessage(botTalk[delayVar-1]);
						},800);
					}
				}
			}
		}
	});


	no.click(function(){
		alert("Oh, I am sorry! What would be a good response to your input?");
		$('.messages').children().last().css('background-color', '#ff6677')
		trainingArea.style.display="inline";
		help.style.display = "inline";
		helpBtn.style.display = "inline";
	})


	helpBtn.click(function(){
		trainingArea.style.display="none";
	
		ref = firebase.database().ref('trainData');
		ref.push().set({ input: inputData, output: {[botTalk.length + 1]: 1} });
	
		ref = firebase.database().ref('botTalk');
		ref.push().set(help.val());
	
		net = new brain.NeuralNetwork();
	
		//Training the AI
		net.train(trainData, {
			log: false,
			logPeriod: 10,
			errorThresh: 0.0005,
		});
	
		alert("Alright! Thanks for making me smarter!");
	
		txt.val('');
		help.val('');
		help.style.display = "none";
		helpBtn.style.display = "none";
	
		console.log('a galera toda depois do alert de thanks:')
		console.log('bottalk', botTalk)
		console.log('trainData', trainData)
	});
	
	
	function textToBinary(text){
		//Storing all letters as binary numbers for AI
		text = text.toUpperCase();
		var data = [];
		
		for (i=0;i<text.length;i++){
			
			if ( text[i]=="A"){
				data = data.concat([1,0,0,0,0,0,0]);
			}
			else if (text[i]=="B"){
				data = data.concat([1,0,0,0,0,0,1]);
			}
			else if (text[i]=="C"){
				data = data.concat([1,0,0,0,0,1,0]);
			}
			else if (text[i]=="D"){
				data = data.concat([1,0,0,0,0,1,1]);
			}
			else if (text[i]=="E"){
				data = data.concat([1,0,0,0,1,0,0]);
			}
			else if (text[i]=="F"){
				data = data.concat([1,0,0,0,1,0,1]);
			}
			else if (text[i]=="G"){
				data = data.concat([1,0,0,0,1,1,0]);
			}
			else if (text[i]=="H"){
				data = data.concat([1,0,0,0,1,1,1]);
			}
			else if (text[i]=="I"){
				data = data.concat([1,0,0,1,0,0,0]);
			}
			else if (text[i]=="J"){
				data = data.concat([1,0,0,1,0,0,1]);
			}
			else if (text[i]=="K"){
				data = data.concat([1,0,0,1,0,1,0]);
			}
			else if (text[i]=="L"){
				data = data.concat([1,0,0,1,0,1,1]);
			}
			else if (text[i]=="M"){
				data = data.concat([1,0,0,1,1,0,0]);
			}
			else if (text[i]=="N"){
				data = data.concat([1,0,0,1,1,0,1]);
			}
			else if (text[i]=="O"){
				data = data.concat([1,0,0,1,1,1,0]);
			}
			else if (text[i]=="P"){
				data = data.concat([1,0,0,1,1,1,1]);
			}
			else if (text[i]=="Q"){
				data = data.concat([1,0,1,0,0,0,0]);
			}
			else if (text[i]=="R"){
				data = data.concat([1,0,1,0,0,0,1]);
			}
			else if (text[i]=="S"){
				data = data.concat([1,0,1,0,0,1,0]);
			}
			else if (text[i]=="T"){
				data = data.concat([1,0,1,0,0,1,1]);
			}
			else if (text[i]=="U"){
				data = data.concat([1,0,1,0,1,0,0]);
			}
			else if (text[i]=="V"){
				data = data.concat([1,0,1,0,1,0,1]);
			}
			else if (text[i]=="W"){
				data = data.concat([1,0,1,0,1,1,0]);
			}
			else if (text[i]=="X"){
				data = data.concat([1,0,1,0,1,1,1]);
			}
			else if (text[i]=="Y"){
				data = data.concat([1,0,1,1,0,0,0]);
			}
			else if (text[i]=="Z"){
				data = data.concat([1,0,1,1,0,0,1]);
			}
			else if (text[i]=="?"){
				data = data.concat([1,1,1,1,1,1,1]);
			}
		}
		//Used the code below to be able to read long arrays
		//console.log(data.toString());
	
		//Fill user input array with zeros to get correct length
		if (data.length < maxLength){
			remainingLength = maxLength - data.length;
			zeroArray = Array(remainingLength).fill(0);
			data = data.concat(zeroArray);
		}
		return data;
	}
});
