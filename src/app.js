/**
 * 一、创建 HTTP 服务
 */

const express = require('express');
const app = express();
const http = require('http').Server(app);

app.set('view engine','ejs');
app.set('views', __dirname + '/views')
app.use(express.static(__dirname + '/public')); // 设置静态资源目录

app.get('/',function(req,res){
    res.render('index');
})

/**
 * 二、创建 socket 服务
 */
const io = require('socket.io')(http);

const usersInfo = []; // 存储用户姓名和头像


 
// 每个连接的用户都有专有的socket
/* 
   io.emit(foo); //会触发所有用户的foo事件
   socket.emit(foo); //只触发当前用户的foo事件
   socket.broadcast.emit(foo); //触发除了当前用户的其他用户的foo事件
*/
io.on('connection', (socket)=> {
    // 渲染在线人员, 主动推送所有的用户信息
    io.emit('dispatchUser', usersInfo);

    // 登录，检测用户名
    socket.on('login', (user)=> {
        if(usersInfo.findIndex(item => item.nickname === user.nickname) >=0 ) { 
            return socket.emit('loginError');
        } 
        socket.nickname = user.nickname;
        usersInfo.push(user);

        socket.emit('loginSuccess');
        io.emit('system', {
            nickname: user.nickname,
            status: '进入'
        });
        io.emit('dispatchUser', usersInfo);
        console.log(usersInfo.length + ' user connect.');
    });


    // 发送消息事件
    socket.on('sendMsg', (data)=> {
        var img = '';
        for(var i = 0; i < usersInfo.length; i++) {
            if(usersInfo[i].nickname == socket.nickname) {
                img = usersInfo[i].img;
            }
        }
        socket.broadcast.emit('receiveMsg', {
            nickname: socket.nickname,
            msg: data.msg,
        });

        socket.emit('receiveMsg', {
            nickname: socket.nickname,
            msg: data.msg
        });
    });  

    // 断开连接时
    socket.on('disconnect', ()=> {
        var index = usersInfo.findIndex(item => item.nickname === socket.nickname); 
        if(index > -1 ) {  // 避免是undefined
            usersInfo.splice(index, 1);  // 删除用户信息

            io.emit('system', {  // 系统通知
                nickname: socket.nickname,
                status: '离开'
            });
            
            io.emit('dispatchUser', usersInfo);  // 重新渲染
            console.log('a user left.');
        }
    });
});

http.listen(3000, function() {
    console.log('App is running http://127.0.0.1:3000');
});