// переменная
let user_data = null;
let selectedPoints = 0;

// input
let get_registration = document.querySelector(".signup-name");
let get_login = document.querySelector(".login-name");
let otherInput = document.querySelector('.other-input')

// блок

let user_info = document.querySelector(".user-info");
let pointsBlock = document.querySelector('.points')

// btns

let btn_registration = document.getElementById("registrationBtn");
let btn_login = document.getElementById("loginBtn");
let fieldCells = document.querySelectorAll('.cell')
let gameButton = document.getElementById('gameButton')

// event listener

btn_registration.addEventListener("click", () => {
  console.log("registration data", get_registration.value);
  if (get_registration.value) {
    register_user(get_registration.value);
  }
});

btn_login.addEventListener("click", () => {
  console.log("login data", get_login.value);
  if (get_login.value) {
    console.log("login", get_login.value);
    login_user(get_login.value)
  }
});

pointsBlock.addEventListener('click', function (event) {

    for(let i = 0; i < pointsBlock.children.length; i++) {
        pointsBlock.children[i].classList.remove('active')
        otherInput.classList.add('disabled')
        otherInput.value = 0
    }


    event.target.classList.toggle('active')

    if(event.target.innerHTML === 'Другое') {
        otherInput.classList.toggle('disabled')
        return
    } else {
        selectedPoints = Number(event.target.innerHTML)
    } 
    toggleGameButton()
})

otherInput.addEventListener('change', function (event) {
    if(!!event.target.value) {
        selectedPoints = Number(event.target.value)
    } else {
        selectedPoints = 0
    }

    toggleGameButton()
})   

gameButton.addEventListener('click', function (event) {
    if(event.target.innerHTML === 'Играть') {
        activateFields()
    }

    event.target.innerHTML === 'Играть'
    ? (event.target.innerHTML = 'Завершить')
    : (event.target.innerHTML = 'Играть')
})

function render_user(user_data) {
  user_info.innerHTML = `[Логин: ${user_data.username}, Баланс: ${user_data.balance}]`;
}

async function register_user(username) {
  console.log("username", username);

  let payload = {
    username: username,
  };

  const data = await sendRequest("user", "POST", payload);

  user_data = {
    username: data.username,
    balance: data.balance,
  };

  console.log("data", data);

  return data;
}

async function login_user(username) {
console.log(username)
  try {
    const data = await sendRequest("user", "GET", `username=${username}`);

    if (data.error) {
      render_user("Неверный логин");
    } else {
      render_user(data);
      user_data = {
        username: data.username,
        balance: data.balance,
      };
    }
    return data;
  } catch (err) {
    throw err;
  }
}

async function startGame (startGameData) {
    try {
        const data = await sendRequest('new game', 'POSt', startGameData)
        return data 
    } catch (err) {
        throw err
    }
}

async function selectField (selectFieldData) {
    try {
        const data = await sendRequest('game_step', "POST", selectFieldData)
        return data 
    } catch (err) {
        throw err
    }
}

async function finishGame (finishGameData) {
    try {
        const data = await sendRequest('stop_game', "POST", finishGameData)
        return data 
    } catch (err) {
        throw err
    }
}

async function sendRequest(url, method, data) {
  url = `https://tg-api.tehnikum.school/tehnikum_course/minesweeper/${url}`;

  if (method == "POST") {
    let response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    response = await response.json();
    return response;
  } else if (method == "GET") {
    url = url + "?" + new URLSearchParams(data);
    let response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    response = await response.json();
    return response;
  }
}

function activateFields() {
    fieldCells.forEach((element) => element.classList.add('active'))
}
function resetFields() {
    fieldCells.forEach((element) =>  {
        element.classList.remove('active')
        element.classList.remove('flag')
        element.classList.remove('bomb')
        element.innerHTML = ''
    })
}

function toggleGameButton () {
    if (selectedPoints && user_data.username) {
        gameButton.classList.remove('disabled-button')
    } else {
        gameButton.classList.add('disabled-button')
    }
}