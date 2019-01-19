var htmlTag = require('hexo-util').htmlTag;
var qnImgTag = function (args, content) {
    var imageName = args[0];
    imgAttr = {}
    imgAttr.src = "http://img.youyag.com/" + imageName;
    return htmlTag('img', imgAttr);
};

hexo.extend.tag.register('qnimg',qnImgTag);