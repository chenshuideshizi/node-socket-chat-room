$(function () {
    let socket = io();

    // 点击输入昵称，回车登录
    $('#nickname-input').keyup((ev) => {
        if (ev.which == 13) {
            handleSubmitName();
        }
    });

    $('#nickname-confirm-btn').click(handleSubmitName);

    // 登录成功，隐藏登录层
    socket.on('loginSuccess', () => {
        $('#nickname-dialog').hide();
    })
    socket.on('loginError', () => {
        alert('用户名已存在，请重新输入！');
        $('#nickname-input').val('');
    });

    function handleSubmitName() {
        let  nickname = $('#nickname-input').val().trim()

        if ( nickname === '') {
            return false
        }

        let imgNum = Math.floor(Math.random() * 4) + 1; // 随机分配头像

        socket.emit('login', {
            nickname: nickname,
            avator: 'image/user' + imgNum + '.jpg'
        }); 
    }


    // 系统提示消息
    socket.on('system', (user) => {
        var date = new Date().toTimeString().slice(0, 8);
        $('#msg-list').append(`<p class='system-msg'><span>${date}</span><br /><span>${user.nickname}  ${user.status}了聊天室<span></p>`);
    });


    // 显示在线人员
    socket.on('dispatchUser', (usersInfo) => {
        displayUserList(usersInfo);
    });

    // 发送消息
    $('#send-btn').click(handleSendMsg);
    $('#msg-textarea').keyup((ev) => {
        if (ev.which == 13) {
            handleSendMsg();
        }
    });


    // 清空历史消息
    $('#close-btn').click(()=> {
        $('#msg-list').text('');
        socket.emit('disconnect');
    });

    // 接收消息
    socket.on('receiveMsg', (data) => {
        debugger
        $('#msg-list').append(`
            <li class="msg-item">
                <span class="msg-nickname">【${data.nickname}】:</span>
                <p class="msg-text">${data.msg}</p>
            </div>
            </li>
        `);
    });


    // 发送消息
    function handleSendMsg() {
        const msg = $('#msg-textarea').val()
        if (msg == '') {
            alert('请输入内容！');
            return false;
        }

        socket.emit('sendMsg', {
            msg
        });
    }

    // 显示在线人员
    function displayUserList(users) {
        $('#user-list').text(''); // 每次都要重新渲染
        if (!users.length) {
            $('#no-user-text').show();
        } else {
            $('#no-user-text').hide();
        }

        $('#user-num').text(users.length);

        for (var i = 0; i < users.length; i++) {
            var $html = `<li class="user-item">
          <img class="user-avator" src="${users[i].avator}">
          <span class="user-nickname">${users[i].nickname}</span>
        </li>`;
            $('#user-list').append($html);
        }
    }

});