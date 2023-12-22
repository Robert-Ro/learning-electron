console.log(window.electronAPI)
window.onload = () => {
  window.electronAPI.setTitle('test-title')
}
// ;(async () => {
//   const filePath = await window.electronAPI.openFile()
//   console.log(filePath)
// })()
function getUserInfo(token) {
  window.axios
    .get('http://localhost:3000/api/users', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => res.data)
    .catch(console.error)
}

;(() => {
  window.electronAPI.onUpdateToken((token) => {
    localStorage.setItem('t', token)
    if (token) getUserInfo(token)
    window.electronAPI.confirmToken()
  })
})()
