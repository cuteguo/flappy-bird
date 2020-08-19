var bird = {
    skyPosition: 0,
    skyStemp: 2,
    birdTop: 235,
    birdStepY: 0,
    startColor: 'blue', 
    startFlag: false,
    minTop: 0,
    maxTop:570,
    pipeLenth: 7,
    pipeArr: [],
    pipeLastIndex: 6,
    score: 0,
    scoreArr: [],
    initData: function(){
        this.el = document.getElementById('wrapper');
        this.obird = this.el.getElementsByClassName('bird')[0];
        this.ostart = this.el.getElementsByClassName('start')[0];
        this.oscore = this.el.getElementsByClassName('scores')[0];
        this.omask = this.el.getElementsByClassName('mask')[0];
        this.oend = this.el.getElementsByClassName('end')[0];
        this.ofinalscore = this.el.getElementsByClassName('final-scores')[0];
        this.oranklist = this.el.getElementsByClassName('rank-list')[0];
        this.scoreArr = this.getScore();
        this.orestart = this.el.getElementsByClassName('restart')[0];
    },

    init: function(){
        this.initData();
        this.animate();
        this.handleStart();
        this.handleClick();
        this.handleRestart();
        if(sessionStorage.getItem('play')){
        this.start();
        }
    },

    getScore: function(){
        var scoreArr = getLocal('score');
        return scoreArr ? scoreArr : [];
    },

    animate: function(){
        var count = 0;
        this.timer = setInterval(() => {
            this.skyMove();

            if(this.startFlag){
                this.birdDrop();
                this.pipeMove();
            }

            if(++ count % 10 === 0){
                if(!this.startFlag){
                    this.birdJump();
                    this.startBound();
    
                }
                this.birdFly(count);
            }
           
           
          
        }, 20);
    },

    skyMove: function (){
       fun = () => {
            this.skyPosition -= this.skyStemp;
            this.el.style.backgroundPositionX = this.skyPosition + 'px'
       }
        fun();
    },

    birdJump: function (){
        this.birdTop = this.birdTop === 235 ? 185 : 235;
        this.obird.style.top = this.birdTop + 'px'
    },

    birdFly: function (count){
        this.obird.style.backgroundPositionX = count % 3 * -30 +'px';
        // console.log(this.obird.style.backgroundPositionX)
    },

    birdDrop: function (){
        this.birdTop += ++ this.birdStepY;
        this.obird.style.top = this.birdTop + 'px';
        this.judgeKnock();
        this.addScore();

    },

    addScore: function (){
        var index = this.score % this.pipeLenth;
        var pipeX = this.pipeArr[index].up.offsetLeft;

        if(pipeX <= 13){
            this.oscore.innerText = ++ this.score
        }
    },

    judgeKnock: function(){
        this.judgeBoundary();
        this.judgePipe();

    },

    judgeBoundary: function(){
        if(this.birdTop <= this.minTop || this.birdTop >=this.maxTop){
            this.failGame();
        }
    },

    judgePipe: function(){
        var index = this.score % this.pipeLenth;
        var pipeX = this.pipeArr[index].up.offsetLeft;
        var pipeY = this.pipeArr[index].y; //[]
        var birdY = this.birdTop;
        if((pipeX <= 95 && pipeX >= 13) && (birdY <= pipeY[0] || birdY >= pipeY[1]) ){
            this.failGame();
        }
    },

    createPipe: function(x){

        var upHeight = 50 + Math.floor(Math.random() * 175);
        var downHeight = 450 - upHeight;
        var oUpPipe = creatEle('div',['pipe','pipe-up'],{
            left: x + 'px',
            height: upHeight + 'px'
        });


        var oDownPipe = creatEle('div',['pipe','pipe-down'],{
            left: x + 'px',
            height: downHeight + 'px',
            
        });
       
        this.el.appendChild(oUpPipe);
        this.el.appendChild(oDownPipe);

        this.pipeArr.push({
            up : oUpPipe,
            down: oDownPipe,
            y: [upHeight, upHeight + 120]
        })
     
        
    },

  

    pipeMove: function(){
        for(var i = 0; i < this.pipeLenth; i ++){
            var oUpPipe = this.pipeArr[i].up;
            var oDownPipe = this.pipeArr[i].down;
            var x = oUpPipe.offsetLeft - this.skyStemp;

            if(x < -52){
                var lastPipleLeft = this.pipeArr[this.pipeLastIndex].up.offsetLeft;
                oUpPipe.style.left = lastPipleLeft +300 + 'px';
                oDownPipe.style.left = lastPipleLeft +300 + 'px';
                this.pipeLastIndex = i;
                continue;
            }
            
            oUpPipe.style.left = x + 'px';
            oDownPipe.style.left = x + 'px';

        }
    },

    startBound: function(){
        var prevColor = this.startColor;
        this.startColor = this.startColor === 'blue' ? 'white' : 'blue';

        this.ostart.classList.remove('start-' + prevColor);
        this.ostart.classList.add('start-' + this.startColor)
    },

    handleStart: function(){
        this.ostart.onclick = this.start.bind(this);
    },

    start: function(){
            this.startFlag = true;
            this.ostart.style.display = 'none';
            this.oscore.style.display = 'block';
            this.obird.style.left = '80px';
            this.obird.style.transition = 'none'
            this.skyStemp = 5;

            for(var i = 0; i < this.pipeLenth; i++){
                this.createPipe(300 * (i + 1));

            }
    },

    handleClick: function(){
        this.el.onclick = e => {
            var dom = e.target;
            var isStart = dom.classList
            if(isStart){
                this.birdStepY = -10;
            }
        }
    },

    handleRestart: function(){
        this.orestart.onclick = () =>{
            sessionStorage.setItem('play' , true);
            window.location.reload();
        }
    },

    failGame: function(){
        clearInterval(this.timer);
        this.setScore();

        this.omask.style.display = 'block';
        this.oend.style.display = 'block';
        this.obird.style.display = 'none';
        this.oscore.style.display = 'none';
        this.ofinalscore.innerText = this.score;

        this.randerRankList();

    },
   
    setScore: function(){
        this.scoreArr.push({
            score: this.score,
            time: this.getDate()
        })

        this.scoreArr.sort(function (a,b){
            return b.score-a.score
        })


        var scoreLength = this.scoreArr.length;
        this.scoreArr.length = scoreLength > 8 ? 8 : scoreLength;
        // console.log(scoreLength)

        setLocal('score', this.scoreArr)
    },

    getDate: function(){

        function checkTime(i)
        {
        if (i<10) {
            i="0" + i
        }
            return i
        }
        var d = new Date();
        var year = checkTime(d.getFullYear());
        var mouth = checkTime(d.getMonth() + 1);
        var day = checkTime(d.getDate());
        var hour = checkTime(d.getHours());
        var minute = checkTime(d.getMinutes());
        var second = checkTime(d.getSeconds());
        return `${year}.${mouth}.${day} ${hour}.${minute}.${second}`
    },

    randerRankList: function(){
        var template = '';
        for(var i = 0; i < this.scoreArr.length ; i ++){
            var scoreObj = this.scoreArr[i];
            var degreeClass = '';
            switch(i) {
                case 0 :
                    degreeClass = 'first';
                    break;
                case 1 :
                    degreeClass = 'second';
                    break;
                case 2 :
                    degreeClass = 'third';
                    break;
            }
            template += `
            <li class="rank-item">
            <span class="rank-num ${degreeClass}">${i+1}</span>
            <span class="rank-scores">${scoreObj.score}</span>
            <span>${scoreObj.time}</span>
        </li>
            `;
        }
        this.oranklist.innerHTML = template
    },

}
bird.init();