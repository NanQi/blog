//引入七牛
let qn = require('qn');
let fs = require('fs');
let join = require('path').join;

let qnConfig = require('./sec/qn.json');


//文件路径查询
function findSync(startPath) {
	let result = [];

	function finder(path) {
		let files = fs.readdirSync(path);
		files.forEach(val => {
            let fPath = join(path, val);
            let stats = fs.statSync(fPath);
            if(stats.isDirectory()) finder(fPath);
            if(stats.isFile()) result.push(fPath);
		});
	}
	finder(startPath);
	return result;
}

let statisConfig = [
    {
        bucket: 'image',
        origin: 'http://img.youyag.com/'
    },
    {
        bucket: 'media',
        origin: 'http://res.youyag.com/'
    }
]

statisConfig.forEach(conf => {
    //上传图片
    let staticPath = 'static/' + conf.bucket;
    let fileNames = findSync(staticPath);

    let client = qn.create({
        accessKey: qnConfig.accessKey,
        secretKey: qnConfig.secretKey,
        bucket: conf.bucket,
        origin: conf.origin,
        uploadURL: 'http://up-z2.qiniup.com/'
    });

    fileNames.forEach(filePath => {
        let key = 'blog/' + filePath.replace(/\\/g, '/').substr(staticPath.length + 1, filePath.length)

        client.uploadFile(filePath, { key }, function(err, result) {
            if(result) {
                console.log(result.url + "---OK")
            } else {
                console.error(err)
            }
        });
    })
});