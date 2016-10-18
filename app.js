var express = require('express');
var jade = require('jade');
var mongoose = require('mongoose');
var _ = require('underscore');
var Article = require('./models/article');
var markdown = require('markdown').markdown;

// 静态资源请求路径
var path = require('path');
var bodyParser= require('body-parser');

var app = express();
var port = process.env.PORT || 3000;
app.locals.moment = require('moment');

mongoose.Promise = require('bluebird');
// article为mongodb的一个数据库
mongoose.connect('mongodb://localhost/article')

app.set('views', './views/pages');
app.set('view engine', 'jade');
// 静态资源请求路径
app.use(express.static(path.join(__dirname, 'public/')));

// 表单数据格式化
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

var emptyArticle = {
    title: "",
    desc: "",
    summary: "",
    content: "",
    author: ""
};

// 路由
// 用户界面
app.get('/', function (req, res) {
    Article.fetch(function (err, articles) {
        if (err) {
            console.log(err);
        }
        res.render('index', {title:'首页', articles: articles});
    });
});
app.get('/article/:id', function (req, res) {
    var id = req.params.id;

    Article.findById(id, function (err, article) {
        article.content = markdown.toHTML(article.content);
        res.render('article', {title:article.title, article: article});
    })
});

// 管理员界面
app.get('/list', function (req, res) {
    Article.fetch(function (err, articles) {
        if (err) {
            console.log(err);
        }
        res.render('list', {title:'列表页', articles: articles});
    });
});
app.get('/new', function (req, res) {
    res.render('new', {title: '后台录入页', article: emptyArticle});
});

// 逻辑控制:插入
app.post('/control/new', function (req, res) {
    var articleObj = req.body.article;
    console.log()
    var id = articleObj._id;
    var _article;
    if (id != 'undefined') {
        Article.findById(id, function (err, article) {
            if (err) {
                console.log(err);
            }
            _article = _.extend(article, articleObj);
            _article.save(function (err, article) {
                if (err) {
                    console.log(err);
                }

                res.redirect('/article/' + article._id);
            });
        });
    } else {
        _article = new Article({
            title: articleObj.title,
            desc: articleObj.desc,
            summary: articleObj.summary,
            content: articleObj.content,
            author: articleObj.author,
        });
        _article.save(function (err, article) {
            if (err) {
                console.log(err);
            }

            res.redirect('/article/' + article._id);
        });
    }
});
// 逻辑控制:更新
app.get('/control/update/:id', function (req, res) {
    var id = req.params.id;

    if (id) {
        Article.findById(id, function (err, article) {
            res.render('new', {
                title: '后台更新页',
                article: article
            })
        })
    }
});
// 逻辑控制:删除
app.delete('/control/delete', function (req, res) {
    var id = req.query.id;

    if (id) {
        Article.remove({_id: id}, function (err, article) {
            if (err) {
                console.log(err);
            } else {
                res.json({success: true});
            }
        });
    }
});

// 监听端口
app.listen(port);
console.log('server started on port: ' + port);