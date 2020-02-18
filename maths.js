var answer;
var score=0;
var BackgroundImages = [];

function nextQuestion(){
    const n1 = Math.floor(Math.random() * 5); //generate random values between 0 and 4
    document.getElementById('n1').innerHTML = n1;
    const n2 = Math.floor(Math.random() * 6); //generate random values between 0 and 5
    document.getElementById('n2').innerHTML= n2;
    answer = n1 + n2;
}

function checkAnswer(){

    const prediction = predictImage();
    console.log(`Answer: ${answer},Prediction: ${prediction}`);
    if(prediction == answer){
        score++;
        console.log(`Correct!.Score:${score}`);
        if(score <= 6){
        BackgroundImages.push(`url('images/background${score}.svg')`);
        document.body.style.backgroundImage = BackgroundImages;}

        else{
        alert('Well done! Your math garden is in full bloom! Want to start again?')
        score = 0;
        BackgroundImages = []; 
        document.body.style.backgroundImage = BackgroundImages;}

        
    }else{
        if(score != 0){score--;}
        console.log(`Wrong! Score${score}`);
        alert('Oops! Check your calculations and try writing the number neater next time.');
        setTimeout(function(){
            BackgroundImages.pop();
            document.body.style.backgroundImage   = BackgroundImages;
        }, 1000);
    }
}