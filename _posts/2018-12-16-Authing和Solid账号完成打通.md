---
title: Authing 和 Solid 账号完成打通 
description: Authing 和 Solid 账号完成打通 
header: Authing 和 Solid 账号完成打通 
---
Authing 和 Solid 账号完成打通 
<!-- more -->
Solid 是万维网之父的去中心化社交网络项目，正式的名称是“社交互联数据”，旨在将数据还给用户。

Authing 是一个服务开发者的身份认证云（为什么身份认证值得上云），可以帮助开发者快速集成登录认证、OAuth、邮件等服务。

Solid 项目仍处于早期，无法有效管理用户，与 Authing 账号打通后可实现注册／登录 Solid 等同于注册／登录 Authing 。管理员使用 Authing 的控制台即可看到 Solid 的活跃状况。


集成的代码已在 Github 开源（搜索：solid-authing）。

solid-authing 使用 Authing 官方架设的 Solid Pod: solid.authing.cn。

## 安装

```
$ npm install solid-authing --save
```

## 引入

```
import SolidAuthing from 'solid-authing';
```

## 注册

```
const main = async () => {    const solidAuthing = new SolidAuthing({
        clientId: 'client_id',
        secret: 'client_secret',
    });    const sa = await solidAuthing.getAuthingInsatance(); //必须调用

    const userInfo = await sa.register();
}main();
```

## 登录

```
const main = async () => {    const solidAuthing = new SolidAuthing({
        clientId: 'client_id',
        secret: 'client_secret',
    });    const sa = await solidAuthing.getAuthingInsatance(); //必须调用

    const userInfo = await sa.login();
}main();
```

## 退出

```
const main = async () => {    const solidAuthing = new SolidAuthing({
        clientId: 'client_id',
        secret: 'client_secret',
    });    const sa = await solidAuthing.getAuthingInsatance(); //必须调用

    const userInfo = await sa.logout();
}main();
~~~

## 获取 Solid 实例

调用完 getAuthingInsatance 后可以使用 solid。

```
const main = async () => {    const solidAuthing = new SolidAuthing({
        clientId: 'client_id',
        secret: 'client_secret',
    });    const sa = await solidAuthing.getAuthingInsatance(); //必须调用

    // sa.solid...

    sa.solid.fetch('https://leinue.solid.authing.cn/public/test.html')
    .then((response) => {        return response.text();
    })
    .then((data) => {        // 打出 test.html 的网页内容
        console.log(data);
    });
}main();
```
