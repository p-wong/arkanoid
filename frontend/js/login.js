const login = document.getElementById('signin')
const name = document.getElementById('name')

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
  .then(json => { parseInt(localStorage.setItem("user_id", json.data.id))
    startGame();
    firstPost();
  })
})
