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
})

// save score for users in scores table, relate the user to the user_id
// when alert is displayed on 
