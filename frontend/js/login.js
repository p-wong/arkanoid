const login = document.getElementById('signin')
const name = document.getElementById('name')
const start = document.getElementById('start')

login.addEventListener('submit', function(e) {
  e.preventDefault()
  // save name in users table
  fetch("http://localhost:3000/users", {
    method: 'POST',
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: `${name.value}`
    })
  })
  .then(res => res.json())
  .then(json => { localStorage.setItem("user_id", json.data.id)
    startGame()
  })
})


// start.addEventListener('click')
