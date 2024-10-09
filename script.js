
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const spinButton = document.getElementById('spin');
const historyList = document.getElementById('historyList');

const prizes = [
    { text: "$10 补贴", probability: 23.5 },
    { text: "$10 补贴", probability: 23.5 },
    { text: "$50 补贴", probability: 22 },
    { text: "$10 补贴", probability: 23.5 },
    { text: "感谢参与", probability: 20.5 },
    { text: "额外两次机会", probability: 20.5 },
    { text: "$100 补贴", probability: 7 },
    { text: "大满贯", probability: 3 }
];
let spinsToday = 0;
let extraSpins = 0;
const totalSpinsPerDay = 2;

function drawWheel() {
    const arc = Math.PI * 2 / prizes.length;
    const outsideRadius = 200;
    const textRadius = 160;
    const insideRadius = 50;
    prizes.forEach((prize, index) => {
        const angle = index * arc;
        ctx.fillStyle = `hsl(${index * 360 / prizes.length}, 100%, 70%)`;
        ctx.beginPath();
        ctx.arc(250, 250, outsideRadius, angle, angle + arc, false);
        ctx.arc(250, 250, insideRadius, angle + arc, angle, true);
        ctx.stroke();
        ctx.fill();

        ctx.save();
        ctx.fillStyle = "black";
        ctx.translate(250 + Math.cos(angle + arc / 2) * textRadius, 
                       250 + Math.sin(angle + arc / 2) * textRadius);
        ctx.rotate(angle + arc / 2 + Math.PI / 2);
        ctx.fillText(prize.text, -ctx.measureText(prize.text).width / 2, 0);
        ctx.restore();
    });
}

spinButton.addEventListener('click', function() {
    spinWheel();
});

function spinWheel() {
    if (spinsToday >= totalSpinsPerDay && extraSpins <= 0) {
        alert("你今天的抽奖次数已用完！");
        return;
    }

    let spinAngleStart = Math.random() * 10 + 10;
    let spinTime = Math.random() * 3000 + 4000;

    let spinAngle = spinAngleStart;
    let startTime = null;

    function rotateWheel(timestamp) {
        if (!startTime) startTime = timestamp;
        const spinTimePassed = timestamp - startTime;
        const frames = spinTimePassed / spinTime * spinAngleStart;

        spinAngle = spinAngleStart - easeOut(frames, 0, spinAngleStart, spinTime);

        drawWheel();
        ctx.save();
        ctx.font = 'bold 30px Helvetica, Arial';
        const text = prizes[Math.floor(prizes.length - spinAngle / 360 * prizes.length) % prizes.length].text;
        ctx.fillText(text, 250 - ctx.measureText(text).width / 2, 250 + 10);
        ctx.restore();

        if (spinTimePassed < spinTime) {
            requestAnimationFrame(rotateWheel);
        } else {
            const prize = getPrize(spinAngle);
            showResult(prize);
            updateSpinCounts(prize);
        }
    }

    function getPrize(angle) {
        const adjustedAngle = angle % 360;
        const prizeIndex = Math.floor(adjustedAngle / (360 / prizes.length));
        return prizes[prizeIndex];
    }

    function showResult(prize) {
        const date = new Date();
        historyList.innerHTML += `<li>${date.toLocaleTimeString()} - ${prize.text}</li>`;
        if (prize.text === "额外两次机会") {
            extraSpins += 2;
        }
    }

    function updateSpinCounts(prize) {
        if (spinsToday < totalSpinsPerDay) {
            spinsToday++;
        } else if (extraSpins > 0) {
            extraSpins--;
        }
    }

    function easeOut(t, b, c, d) {
        return -c * (t /= d) * (t - 2) + b;
    }

    requestAnimationFrame(rotateWheel);
}
