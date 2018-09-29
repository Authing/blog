---
title: JSON Web Token 解析接口变更说明 | Authing 官方博客
description: JSON Web Token 解析接口变更说明
header: JSON Web Token 解析接口变更说明
---

为了提高安全性，我们更新了 JavaScript SDK 中的 decodeToken 方法，该方法可用来解析用户的 Token，获取用户 id 等源信息。

最新接口调用需经过网络，故原接口已不可用，请尽快升级 JavaScript SDK 到 1.1.2 版本以上。
