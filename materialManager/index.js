Promise.resolve(new Promise((resolve,reject) => {
    setTimeout(() => {
        reject('reject')
    }, 3000);
})).then(res => {
    console.log(res)
}).catch(err => {
    console.log('err',err)
})