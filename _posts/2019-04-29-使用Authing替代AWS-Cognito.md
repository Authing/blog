---
title: 使用 Authing + Lambda 替代 AWS Cognito
---
AWSuthing + Lambda 轻松替代 AWS Cognito
<!-- more -->
![](http://img.staryu.cn/20190710-authing.jpg)

Amazon Web Services(AWS) 虽然作为市场份额全球第一的云计算厂商，其产品也不是完美无缺的，Cognito （AWS 的身份认证解决方案）及其附带的中文文档就是一个反面教材，其难用程度令人发指。当然，除了不易用之外，还有访问速度缓慢，不适用于中国市场等问题存在。

而国产的 Authing 可以解决使用 Cognito 的诸多问题，先看一下 Authing 的介绍：

    Authing 是一个身份认证服务商，其提供了企业级身份认证和管理解决方案，客户分布教育、IoT、互联网和电商等多个行业。

Lambda 是一个由 AWS 提供的 Function-as-a-Service (FaaS) 平台 。Lambda 和 AWS 生态结合的非常紧密，接入 Lambda 后，开发者可以使用 AWS 生态内的所有资源。比如，我们可以创建一个 Lambda 函数，让用户通过 Cognito 登录（当然这篇文章是让用户使用 Authing 登录），然后再调用另外一个可以上传文件到 S3（AWS 的存储服务） 的 Lambda 函数。

这类平台（现在多被称为 Serverless，无服务器架构）的一个好处是可以让开发者无需担心基础设施，专心业务研发。

FaaS 或者说 Serverless 平台正在逐渐获得市场关注，因为这种类型的平台可以让开发者不用再关注基础设施。"What is serverless" 这篇文章详细的讲解了什么是「无服务器计算」和「无服务器计算」的好处，推荐读一下。

这篇文章的主要目的是介绍如何使用 Authing + Lambda 替代 AWS Cogito，线上体验地址为：https://sample.authing.cn/aws。

![](http://img.staryu.cn/20190429-authing-cognito-lambda.jpg)

此外，Authing 遵循 OIDC 规范，所以本篇文章将使用 OIDC 来做认证，如果你还不了解什么是 OIDC，请先到网上搜索一下。

## 首先确认下用户的操作流程

1. 打开页面：sample.authing.cn/aws/；
2. 点击 Login 进行登录，此时跳转到 Authing 的登录页面（应用的二级域名）；
3. 输入账号密码进行登录，若没有账号密码则先进行注册；
4. 登录成功后返回第一步打开的页面，并显示登录用户的头像；
5. 此时用户可以看到从 AWS Lambda 请求回来的 Private 信息；

## 创建一个 Authing 应用

如果你还没有注册 Authing，那么请点击这里进行注册，注册完成后，按以下步骤创建一个 Authing 应用。

### 1. 创建应用

![](http://img.staryu.cn/20190429-authing-cognito-lambda-02.jpg)

### 2. 填写基本信息，应用类型选择 Web 应用

![](http://img.staryu.cn/20190429-authing-cognito-lambda-03.jpg)

### 3. 创建完成后会进入到应用主页（空空如也）

![](http://img.staryu.cn/20190429-authing-cognito-lambda-04.jpg)

## 创建 OIDC 应用

创建完应用后相当于你有了一个用户池，接下来你可以创建 OIDC 应用来授权其他程序（你自己写的或其他第三方程序）访问你的用户池。

### 4. 点击「第三方登录」开始创建 OIDC 应用

![](http://img.staryu.cn/20190429-authing-cognito-lambda-05.jpg)

### 5. 选择「OIDC 应用」选项卡，并点击「创建 OIDC 应用」

![](http://img.staryu.cn/20190429-authing-cognito-lambda-06.jpg)

### 6. 填写应用名和认证地址，并勾选 id_token token

![](http://img.staryu.cn/20190429-authing-cognito-lambda-06.jpg)

这里要说明一下，创建 OIDC 应用时的认证地址将由 Authing 生成一个二级域名（支持 HTTPS），且不能重复，回调 URL 填写你自己的回调地址即可，在这里我用的是 https://authing.cn，注意，OIDC 协议中不允许回调 URL 为 localhost，请使用代理工具进行调试。

### 7. 点击确认，就可以看到我们有了第一个基于 OIDC 协议的授权应用

![](http://img.staryu.cn/20190429-authing-cognito-lambda-08.jpg)

创建完成后你可以访问 lambda.authing.cn ，此时会看到报了一个错，别害怕，这是因为我们发起的授权链接不正确。

### 8. 访问 lambda.authing.cn 时报的错

![](http://img.staryu.cn/20190429-authing-cognito-lambda-09.jpg)

发起正确授权请求的方式请继续往下看。

## 发起授权请求

和绝大多数的 OAuth 应用差不多，OIDC 的授权链接也需要拼接（如果你开发过微信应用，应该会很容易理解），Authing OIDC 应用的授权链接符合标准规范，具体格式为：

https://lambda.authing.cn/oauth/oidc/auth?client_id=<应用 ID>&redirect_uri=<回调 URL，必须和平台配置完全一样>&scope=openid profile&response_type=<OIDC 模式，分为好几种>&state=<一个随机字符串，用来防范 CSRF 攻击>

若需要查看详细的参数，请点击这里查看。

例如：

https://lambda.authing.cn/oauth/oidc/auth?client_id=5cc41c06d14c740a0c93ba6f&redirect_uri=https://authing.cn&scope=openid profile&response_type=id_token token&state=jacket

为了简单起见，这里我们的 response_type 设置为「id_token token」，这样不需要使用「code」换取 token，token 会直接附带到回调地址中。

### 9. 如果你的授权链接正确，应该可以看到上图这样的登录窗口
![](http://img.staryu.cn/20190429-authing-cognito-lambda-10.jpg)

如果你的授权链接正确，应该可以看到上图这样的登录窗口，同时这个窗口也是你的终端用户所使用的窗口，他们都将从这里登录然后回调到你配置好的回调 URL 中。

你可以试着注册一个账号然后进行登录，登录完成后可以在控制台中观察到登录状况。
### 10. 注册成功

![](http://img.staryu.cn/20190429-authing-cognito-lambda-11.jpg)

### 11. 登录之后的授权页面

![](http://img.staryu.cn/20190429-authing-cognito-lambda-12.jpg)

### 12. 控制台中观察到的用户数据

![](http://img.staryu.cn/20190429-authing-cognito-lambda-13.jpg)

在你登录成功后应该会看到回调到了你填写 URL 中，并且附带了很多参数，接下来我们会阐述如何使用这些参数。

获取用户信息

回调到在控制台中配置的 redirect_uri 中后，将附带以下信息：

```
{
	"id_token": "JWT_TOKEN",
	"access_token": "JWT_TOKEN",
	"expires_in": "3600",
	"token_type": "Bearer",
	"state": "jacket",
	"session_state": "644d7b324ba61d517fdedd28b5b6e365d78f2a8178f2ee742474d5b57a99eb3f"
}
```

可以看到其中包含了 access_token 和 id_token，其中 access_token 可以帮助你从 Authing 后端获取用户信息，而 id_token 中包含了基本的信息，如果你要获取用户的头像，那么是需要通过 access_token 获取的。

我们先看一个 id_token 的例子：

```
eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InIxTGtiQm8zOTI1UmIyWkZGckt5VTNNVmV4OVQyODE3S3gwdmJpNmlfS2MifQ.eyJzdWIiOiI1Y2MyYTg1MTFiYmFmMDRmOTNjZTQ4OWYiLCJub25jZSI6IjE4MzEyODkiLCJzaWQiOiI5MzkwZDA1ZC01ZTM3LTQ3ZWUtODJjNi1jNTQ1ZjA2ODhhMDAiLCJhdF9oYXNoIjoiNmxZMGRXajZYUTY0aExWdHAtR2tEdyIsInNfaGFzaCI6IlZVOU5QYV9JQ0VTSEdxRmxUZ3A2LUEiLCJhdWQiOiI1Y2MyYjU0OGQxNGM3NDJkYjg5M2JhNTUiLCJleHAiOjE1NTYzNjY0ODksImlhdCI6MTU1NjM2Mjg4OSwiaXNzIjoiaHR0cHM6Ly9vYXV0aC5hdXRoaW5nLmNuL29hdXRoL29pZGMifQ.Qc_OMqMf6_wwzW2SsEgEtiaGr3ZY1FWHnRrMU2M7LADGlNpq_pvPrFxAVsR2j-BFr1y48M-Trvq6yAu4_ZOUBHPtIIpoQ5W2bnABytUV693ZcwNlf9CCiLc-k0LG3o1U-BmiH3L6NAV7aKGsfVHS8toiNbVDuimPVdYJsRrF2C1jj1meM1K8FBVwqozXm6YtB--u3sqY4IszHnd5PMEWguLsOkpZJIh7xWeYPpVQ5WKfx0cA8rB_T2puSCbeaUVhgIwNADy06qBqXhUOiA4gdcNbHtx7tvGZMxzMC3rdjpXoZk89Duh3O5tHlMtaBlidJGYavUSjVl7potESecSlBg
```

使用 jwt.io 解析后将得到如下结果：

```
{
  "sub": "5cc2a8511bbaf04f93ce489f",
  "nonce": "1831289",
  "sid": "9390d05d-5e37-47ee-82c6-c545f0688a00",
  "at_hash": "6lY0dWj6XQ64hLVtp-GkDw",
  "s_hash": "VU9NPa_ICESHGqFlTgp6-A",
  "aud": "5cc2b548d14c742db893ba55",
  "exp": 1556366489,
  "iat": 1556362889,
  "iss": "https://oauth.authing.cn/oauth/oidc"
}
```

**其中包含了签发时间（iat）、过期时间（exp）等字段，可以用来判断用户有没有被认证过，在 OIDC 的规范中，JWT 使用 OIDC 应用的 secret 签发，需要开发者在后端验证（这一步我们将会在 Lambda 中执行）后继续执行开发者本身的业务流程。**

再来看看 access_token 的例子：

```
eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InIxTGtiQm8zOTI1UmIyWkZGckt5VTNNVmV4OVQyODE3S3gwdmJpNmlfS2MifQ.eyJqdGkiOiJza0p-bTNaYmZsTjVxVGEzR2J2YlMiLCJzdWIiOiI1Y2MyYTg1MTFiYmFmMDRmOTNjZTQ4OWYiLCJpc3MiOiJodHRwczovL29hdXRoLmF1dGhpbmcuY24vb2F1dGgvb2lkYyIsImlhdCI6MTU1NjM2Mjg4OSwiZXhwIjoxNTU2MzY2NDg5LCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIiwiYXVkIjoiNWNjMmI1NDhkMTRjNzQyZGI4OTNiYTU1In0.Uf3YK4D9HL-G71hkA4cWt5kitDo5rNgwVA9Vqlv4RjAILNDTylYWtkacKJpLcOSS81ivaNpDVNYYzBSoyN-eMH80VhArPUre74F9SHdonA-IVFVPT0DHRtOAJI9kqDW4tgTXhZeZMUm-MCjVjR-q8XrayXaqrC5Hu5W3D1N-K_jZOlwxzIBf51nuC4NMvSI_wPpYj2WPzGxFwpfTCEbnhj5RO0CcThRpC3EdmpbtcJqStd7AZQhkLyTb1TQLHJOel8DSxLnLnoIU0rZXsodK6EjE_oqRLagetNXF1cKfRmnGFaAKZKqgvHc527S_CVkgXIwcHBRmDeqo93CCId_hmQ
```

使用 jwt.io 解析后将得到如下结果：

```
{
  "jti": "skJ~m3ZbflN5qTa3GbvbS",
  "sub": "5cc2a8511bbaf04f93ce489f",
  "iss": "https://oauth.authing.cn/oauth/oidc",
  "iat": 1556362889,
  "exp": 1556366489,
  "scope": "openid profile",
  "aud": "5cc2b548d14c742db893ba55"
}
```

可以看到 access_token 相比 id_token 是少了很多信息的，这里有一段英文的介绍，该介绍讲解了 access_token 和 id_token 的区别：

```
ID Tokens vs Access Tokens. The ID Token is a security token granted by the OpenID Provider that contains information about an End-User. This information tells your client application that the user is authenticated, and can also give you information like their username or locale.You can pass an ID Token around different components of your client, and these components can use the ID Token to confirm that the user is authenticated and also to retrieve information about them.Access tokens, on the other hand, are not intended to carry information about the user. They simply allow access to certain defined server resources. More discussion about when to use access tokens can be found in Validating Access Tokens.
```

简单来讲，id_token 告诉你用户被验证过了，而 access_token 是一个你可以访问资源服务器（这里就是 Authing） 的一个凭证。

同时也可以看到，idtoken 包含的信息较少，如果想获取更多信息，需要使用 access_token 来获取。获取方式也非常简单，只需要往以下链接发送 GET 请求并且附带 access_token 即可，如：

```
$ curl https://users.authing.cn/oauth/oidc/user/userinfo?access_token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InIxTGtiQm8zOTI1UmIyWkZGckt5VTNNVmV4OVQy...balabala...verylong...
```

可以获取到 id 等信息，获取到 id 之后你可以将 id 存储到你自己的数据库中以完成自己的实际业务。

```
{
    "sub":"5cc2a8511bbaf04f93ce489f",
    "nickname":"",
    "picture":"https://usercontents.authing.cn/authing-avatar.png"
}
```

上面的 JSON 是一个使用 access_token 换取用户数据后的返回结果。

好了，现在我们已经获取到 Token 了，接下来我们需要在 Lambda 中验证这个 Token 的合法性并在前端显示不同的信息。

## 编写 Lambda 函数

编写 Lambda 函数推荐使用 Serverless 这个 CLI，AWS 控制台中的函数编写堪称让人痛不欲生。

同时，你可以到这里查看完整代码。

Lambda 在这篇文章中主要用来做三件事：

1. 对 id_token 进行认证，以获取用户是否被认证过；
2. 提供一个 Public API，此 API 可以直接被访问；
3. 提供一个 Private API，此 API 需要经过认证后被访问；

## 对 id_token 进行认证

认证 id_token 首先需要知道 OIDC 应用的 secret，此值可以在 Authing 控制台查看 OIDC 应用的详情中找到：

![](http://img.staryu.cn/20190429-authing-cognito-lambda-15.jpg)

id_token 在签发时的签名是此 secret ，因此在 JavaScript 中可以直接使用 jsonwebtoken 这个库来验证 id_token 的合法性（详情请参考：验证 Token 合法性）。

在控制台中安装 jsonwebtoken：

```
$ npm install jsonwebtoken --save
```

P.S. 在 lambda 中引入包后会一起打包上传到 AWS Lambda 运行时中。

```
const jwt = require('jsonwebtoken');

// Policy helper function 
// 这是 AWS 提供的模版代码，这里不需要做修改
const generatePolicy = (principalId, effect, resource) => {
  const authResponse = {};
  authResponse.principalId = principalId;
  if (effect && resource) {
    const policyDocument = {};
    policyDocument.Version = '2012-10-17';
    policyDocument.Statement = [];
    const statementOne = {};
    statementOne.Action = 'execute-api:Invoke';
    statementOne.Effect = effect;
    statementOne.Resource = resource;
    policyDocument.Statement[0] = statementOne;
    authResponse.policyDocument = policyDocument;
  }
  return authResponse;
};

// Reusable Authorizer function, set on `authorizer` field in serverless.yml
module.exports.auth = async (event, context, cb) => {
  if (event.authorizationToken) {
    // remove "bearer " from token
    const token = event.authorizationToken.substring(7);

    try {
        let decoded = jwt.verify(token, 'YOUR_OIDC_APP_SECRET'),
          expired = (Date.parse(new Date()) / 1000) > decoded.exp;
        if (expired) {
          cb('Unauthorized, Login information has expired.');
        }else {
          cb(null, generatePolicy('user', 'Allow', event.methodArn));
        }
      } catch (error) {
        cb('Unauthorized');
      }
  } else {
    cb('Unauthorized');
  }
};
```

## 公共 API

```
// Public API
module.exports.publicEndpoint = (event, context, cb) => {
  cb(null, { message: 'Welcome to our Public API!' });
};
```

## 私有 API

```
// Private API
module.exports.privateEndpoint = (event, context, cb) => {
  cb(null, { message: 'Only logged in users can see this' });
};
```

## serverless.yml

```
service: serverless-authorizerprovider: 
 name: aws runtime: nodejs8.10functions:  auth:    handler: handler.auth  getUserInfo:    handler: handler.getUserInfo    events:      - http:          path: api/userInfo          method: get          integration: lambda          cors: true    
  publicEndpoint:    handler: handler.publicEndpoint    events:      - http:          path: api/public          method: get          integration: lambda          cors: true  privateEndpoint:    handler: handler.privateEndpoint    events:      - http:          path: api/private          method: get          integration: lambda          authorizer: auth # See custom authorizer docs here: http://bit.ly/2gXw9pO          cors: true
```

此文件可用来配置需要鉴权的路由，如上面代码中的 privateEndpoint，配置了 authorizer 为 auth 函数。

完整代码请参考：https://github.com/authing/authing-lambda

## 测试 Lambda

写完了代码之后我们需要进行测试。

Lambda 支持直接在本地测试，可以使用如下命令：

```
$ sls invoke local -f auth --data '{"authorizationToken": "Bearer <id_token>"}'
```

如果本地测试返回了如下信息则表示验证成功：
```
{
    "principalId": "user"
}
```

## 部署 Lambda

```
$ serverless deploy
```

部署完成后会得到三个链接，这三个链接分别是上述代码的三个函数。
![](http://img.staryu.cn/20190429-authing-cognito-lambda-16.jpg)

使用 curl 或 postman 将 OIDC 登录后的 id_token 携带到 header 的 Authorization 中即可查看结果，如：

```
$ curl --header "Authorization: <id_token>" <endpoint>
```

```
curl <endpoint/dev/api/public> - Should work! Public!
curl <endpoint/dev/api/private> - Should not work
curl --header "Authorization: <id_token>" <endpoint/dev/api/private> - Should work! Authorized!
```
最后，在我们的前端补充上相关信息，在点击登录后应该可以看到如下信息：

![](http://img.staryu.cn/20190429-authing-cognito-lambda-17.jpg)

**线上体验地址：sample.authing.cn/aws/**

#### Enjoy!