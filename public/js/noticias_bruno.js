function obterNoticias(){
    fetch("/news/obter").then(res => {
        res.json().then(data => {
            console.log(data)
        })
    })
}