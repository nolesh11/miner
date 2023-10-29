document.oncontextmenu = function () {
  return false
}

// переменная
let userData = null
let selectedPoints = 0
let gameId = null

// input
const getRegistration = document.querySelector('.signup-name')
const getLogin = document.querySelector('.login-name')
const otherInput = document.querySelector('.other-input')

// блок

const userInfo = document.querySelector('.user-info')
const pointsBlock = document.querySelector('.points')

// btns

const btnRegistration = document.getElementById('registrationBtn')
const btnLogin = document.getElementById('loginBtn')
const fieldCells = document.querySelectorAll('.cell')
const gameButton = document.getElementById('gameButton')

// event listener

btnRegistration.addEventListener('click', () => {
  console.log('registration data', getRegistration.value)
  if (getRegistration.value) {
    registerUser(getRegistration.value)
  }
})

btnLogin.addEventListener('click', () => {
  console.log('login data', getLogin.value)
  if (getLogin.value) {
    console.log('login', getLogin.value)
    loginUser(getLogin.value)
  }
})

pointsBlock.addEventListener('click', function (event) {
  for (let i = 0; i < pointsBlock.children.length; i++) {
    pointsBlock.children[i].classList.remove('active')
    otherInput.classList.add('disabled')
    otherInput.value = 0
  }

  event.target.classList.toggle('active')

  if (event.target.innerHTML === 'Другое') {
    otherInput.classList.toggle('disabled')
    return
  } else {
    selectedPoints = Number(event.target.innerHTML)
  }
  toggleGameButton()
})

otherInput.addEventListener('change', function (event) {
  if (event.target.value) {
    selectedPoints = Number(event.target.value)
  } else {
    selectedPoints = 0
  }

  toggleGameButton()
})

gameButton.addEventListener('click', function (event) {
  if (event.target.innerHTML === 'Играть') {
    const payload = {
      username: userData.username,
      points: selectedPoints
    }
    startGame(payload)
    activateFields()
  } else {
    const payload = {
      username: userData.username,
      game_id: gameId
    }

    finishGame(payload)
    resetFields()
  }

  event.target.innerHTML === 'Играть'
    ? (event.target.innerHTML = 'Завершить')
    : (event.target.innerHTML = 'Играть')
})

function renderUser (userData) {
  userInfo.innerHTML = `[Логин: ${userData.username}, Баланс: ${userData.balance}]`
}

async function registerUser (username) {
  console.log('username', username)

  const payload = {
    username
  }

  const data = await sendRequest('user', 'POST', payload)
  userData = {
    username: data.username,
    balance: data.balance
  }

  console.log('data', data)

  return data
}

async function loginUser (username) {
  console.log(username)

  const data = await sendRequest('user', 'GET', `username=${username}`)

  if (data.error) {
    renderUser('Неверный логин')
  } else {
    renderUser(data)
    userData = {
      username: data.username,
      balance: data.balance
    }
  }
  return data
}

async function startGame (startGameData) {
  const data = await sendRequest('new_game', 'POST', startGameData)
  gameId = data.game_id
  renderUser({
    username: userData.username,
    balance: data.user_balance
  })

  renderTable(data.table)

  return data
}

async function selectField (selectFieldData) {
  const data = await sendRequest('game_step', 'POST', selectFieldData)
  return data
}

async function finishGame (finishGameData) {
  const data = await sendRequest('stop_game', 'POST', finishGameData)
  return data
}

async function sendRequest (url, method, data) {
  url = `https://tg-api.tehnikum.school/tehnikum_course/minesweeper/${url}`

  if (method === 'POST') {
    let response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    response = await response.json()
    return response
  } else if (method === 'GET') {
    url = url + '?' + new URLSearchParams(data)
    let response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    })
    response = await response.json()
    return response
  }
}

function activateFields () {
  fieldCells.forEach((element) => {
    element.classList.add('active')
    element.addEventListener('contextmenu', function () {
      element.classList.add('flag')
    })
    element.addEventListener('click', function () {
      const row = element.getAttribute('row')
      const column = element.getAttribute('column')

      selectField({
        game_id: gameId,
        row, // row: row,
        column // column: column
      })
    })
  })
}

function resetFields () {
  fieldCells.forEach((element) => {
    element.classList.remove('active')
    element.classList.remove('flag')
    element.classList.remove('bomb')
    element.innerHTML = ''
  })
}

function toggleGameButton () {
  if (selectedPoints && userData.username) {
    gameButton.classList.remove('disabled-button')
  } else {
    gameButton.classList.add('disabled-button')
  }
}

function renderTable (table) {
  let elementIndex = 0
  for (let i = 0; i < table.length; i++) {
    const tableRow = table[i]
    for (let j = 0; j < tableRow.length; j++) {
      fieldCells[elementIndex].setAttribute('row', i)
      fieldCells[elementIndex].setAttribute('column', j)
      elementIndex += 1
    }
  }
}
