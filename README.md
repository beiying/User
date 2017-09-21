User(用户信息)模块
============

1. 新用户初始化id
POST:
    http://user.api.jndroid.com/init
Body:

    {
            "imei": "",//手机IMEI码(15位)
            "mac": "",//设备MAC地址
            "idfv": "",//iphone手机的Vindor标示符，适用于对内
            "idfa": "",//iphone手机的广告标示符，适用于对外
            //上述参数至少存在一个，标志用户时的优先级phone > imei > mac > idfv > idfa
    }
RES:
    {
      "err_no": 0,
      "result": {
            "imei": "879273942",
            "wealth": 10,
            "uid": 19
      }
    返回result为一个整数，表示该用户的id
2. 新用户注册
POST:
    http://user.api.jndroid.com/register
Body:
    {
        "uid": 12,
        "phone": 13221231565,
        "pwd": 123456,
        "code": 1234
    }

RES:
    {
      "err_no": 0,
      "result": {
            "uid": 12,
            "phone": "13221231565",
      }
    }
3. 获取验证码
    POST:
        http://user.api.jndroid.com/vcode/get
    Body:
        {
            "phone": 13221231565,
            "action": "reset" //reset表示重置密码， register表示注册
        }
    RES:
        {
          "err_no": 0,
          "result": {
            "err_code": 1001,   //err_code如果是0就没有err_des
            "err_des": "该手机号已经注册过"
          }
        }
4. 用户登录
POST:
    http://user.api.jndroid.com/login
Body:
    {
        "uid": 12,
        "phone": "13221231565",
        "pwd": "123456",
    }

RES:
    {
        "err_no": 0，
        "result": {
            "uid": 12,
            "phone": "13221231565",
        }
    }
5. 三方账号登录绑定手机号
POST:
    http://user.api.jndroid.com/bind
Body:

    {
            "uid": 25543,(必需)
            "source": "weibo",(必需)
            "phone": "13720251343",//手机号（11位）
            "vcode": "1234",
        	"weibo_info": {
             	"id": 1404376560,
                "screen_name": "zaku",
                "name": "zaku",
                "province": "11",
                "city": "5",
                "location": "北京 朝阳区",
                "description": "人生五十年，乃如梦如幻；有生斯有死，壮士复何憾。",
                "url": "http://blog.sina.com.cn/zaku",
                "profile_image_url": "http://tp1.sinaimg.cn/1404376560/50/0/1",
                "domain": "zaku",
                "gender": "f",
                "followers_count": 1204,
                "friends_count": 447,
                "statuses_count": 2908,
                "favourites_count": 0,
                "created_at": "Fri Aug 28 00:00:00 +0800 2009",
                "following": false,
                "allow_all_act_msg": false,
                "geo_enabled": true,
                "verified": false
            },
            "qq_info": {
            },
            "wechat_info": {
            }
            //上述信息至少有一个
    }

RES:
    {
      "err_no": 0
      "result":{
            "uid": 25543,
            "source": "weibo",
            "phone": "13720251343",//手机号（11位）
        	"weibo_info": {
             	"id": 1404376560,
                "screen_name": "zaku",
                "name": "zaku",
                "province": "11",
                "city": "5",
                "location": "北京 朝阳区",
                "description": "人生五十年，乃如梦如幻；有生斯有死，壮士复何憾。",
                "url": "http://blog.sina.com.cn/zaku",
                "profile_image_url": "http://tp1.sinaimg.cn/1404376560/50/0/1",
                "domain": "zaku",
                "gender": "f",
                "followers_count": 1204,
                "friends_count": 447,
                "statuses_count": 2908,
                "favourites_count": 0,
                "created_at": "Fri Aug 28 00:00:00 +0800 2009",
                "following": false,
                "allow_all_act_msg": false,
                "geo_enabled": true,
                "verified": false
            },
            "qq_info": {
            },
            "wechat_info": {
            }
            //上述信息至少有一个
        }
    }


6. 检查三方账号是否绑定手机号
POST:
    http://user.api.jndroid.com/bind/check
Body:

    {
            "uid": 25543,(必需)
            "source": "weibo",(必需)
        	"weibo_info": {
             	"id": 1404376560,
                "screen_name": "zaku",
                "name": "zaku",
                "province": "11",
                "city": "5",
                "location": "北京 朝阳区",
                "description": "人生五十年，乃如梦如幻；有生斯有死，壮士复何憾。",
                "url": "http://blog.sina.com.cn/zaku",
                "profile_image_url": "http://tp1.sinaimg.cn/1404376560/50/0/1",
                "domain": "zaku",
                "gender": "f",
                "followers_count": 1204,
                "friends_count": 447,
                "statuses_count": 2908,
                "favourites_count": 0,
                "created_at": "Fri Aug 28 00:00:00 +0800 2009",
                "following": false,
                "allow_all_act_msg": false,
                "geo_enabled": true,
                "verified": false
            },
            "qq_info": {
            },
            "wechat_info": {
            }
            //上述信息至少有一个
        }

RES:
    {
      "err_no": 0
      "result":{
            "uid": 25543,
            "source": "weibo",
            "phone": "13720251343",//手机号（11位）
        	"weibo_info": {
             	"id": 1404376560,
                "screen_name": "zaku",
                "name": "zaku",
                "province": "11",
                "city": "5",
                "location": "北京 朝阳区",
                "description": "人生五十年，乃如梦如幻；有生斯有死，壮士复何憾。",
                "url": "http://blog.sina.com.cn/zaku",
                "profile_image_url": "http://tp1.sinaimg.cn/1404376560/50/0/1",
                "domain": "zaku",
                "gender": "f",
                "followers_count": 1204,
                "friends_count": 447,
                "statuses_count": 2908,
                "favourites_count": 0,
                "created_at": "Fri Aug 28 00:00:00 +0800 2009",
                "following": false,
                "allow_all_act_msg": false,
                "geo_enabled": true,
                "verified": false
            },
            "qq_info": {
            },
            "wechat_info": {
            }
            //上述信息至少有一个
        }
    }

7. 重置密码
POST:
    http://user.api.jndroid.com/reset/password
Body:
    {
        "uid": 12,
        "phone": "13221231565",
        "pwd": "123456",
        "vcode": "1234"
    }

RES:
    {
      "err_no": 0      //
      "result": {
                  "uid": 12,
                  "phone": "13221231565",
              }
    }

8. 获取用户信息
GET:
    http://user.api.jndroid.com/get?uid=25543

RES:
    {
      "err_no": 0,
      "result": {
                    "uid": 25543,
                    "source": "qq",
                    "phone": "13720251343",//手机号（11位）
                    "imei": "",//手机IMEI码(15位)
                    "mac": "",//设备MAC地址
                    "idfv": "",//iphone手机的Vindor标示符，适用于对内
                    "idfa": "",//iphone手机的广告标示符，适用于对外
                    "weibo_info": {
                     	"id": 1404376560,
                        "screen_name": "zaku",
                        "name": "zaku",
                        "province": "11",
                        "city": "5",
                        "location": "北京 朝阳区",
                        "description": "人生五十年，乃如梦如幻；有生斯有死，壮士复何憾。",
                        "url": "http://blog.sina.com.cn/zaku",
                        "profile_image_url": "http://tp1.sinaimg.cn/1404376560/50/0/1",
                        "domain": "zaku",
                        "gender": "f",
                        "followers_count": 1204,
                        "friends_count": 447,
                        "statuses_count": 2908,
                        "favourites_count": 0,
                        "created_at": "Fri Aug 28 00:00:00 +0800 2009",
                        "following": false,
                        "allow_all_act_msg": false,
                        "geo_enabled": true,
                        "verified": false
                    },
                    "qq_info": {
                    },
                    "wechat_info": {
                    }
              }
    }


9. 更新用户信息
POST:
    http://user.api.jndroid.com/update
Body:
    {
            "uid": 25543,(必需)
            "source": "qq",
            "phone": "13720251343",//手机号（11位）
            "imei": "",//手机IMEI码(15位)
            "mac": "",//设备MAC地址
            "idfv": "",//iphone手机的Vindor标示符，适用于对内
            "idfa": "",//iphone手机的广告标示符，适用于对外
        	"weibo_info": {
             	"id": 1404376560,
                "screen_name": "zaku",
                "name": "zaku",
                "province": "11",
                "city": "5",
                "location": "北京 朝阳区",
                "description": "人生五十年，乃如梦如幻；有生斯有死，壮士复何憾。",
                "url": "http://blog.sina.com.cn/zaku",
                "profile_image_url": "http://tp1.sinaimg.cn/1404376560/50/0/1",
                "domain": "zaku",
                "gender": "f",
                "followers_count": 1204,
                "friends_count": 447,
                "statuses_count": 2908,
                "favourites_count": 0,
                "created_at": "Fri Aug 28 00:00:00 +0800 2009",
                "following": false,
                "allow_all_act_msg": false,
                "geo_enabled": true,
                "verified": false
            },
            "qq_info": {
            },
            "wechat_info": {
            }
        }

RES:
    {
      "err_no": 0
    }


10. 删除用户信息
GET:
    http://user.api.jndroid.com/del?uid=25543

RES:
    {
      "err_no": 0,
      "result":25543
    }







******************************************************************************************************
******************************************************************************************************

以下接口暂时不用

******************************************************************************************************
******************************************************************************************************

11 .购买语料块
POST:
    http://user.api.jndroid.com/legobrick/buy
Body:
    {
        "uid": 25543,
        "lego_brick_id": 233  //语料id
    }
RES:
    {
        "err_no": 0,
        "result": 888   //剩余聊豆
    }
9.获取用户购买的指定应用的语料块
GET:
    http://user.api.jndroid.com/legobrick/get?uid=2333&app=baozou
RES:
    {
      "err_no": 0,
      "result":[1,2,3,4]  //legobrick的Id数组
    }


10.获取用户购买的所有语料块
GET:
    http://user.api.jndroid.com/legobrick/all?uid=25543

RES:
    {
      "err_no": 0,
      "result":[{
            "name": "微博_几多愁先生",
            "desc": "微博知名情感两性帐号",
            "tag": "情感|两性|搞笑幽默|微博",
            "class": "text",
            "type": "app",
            "parent_id": 0,
            "created_at": 1492669397222,
            "id": 9,
            "washid": "d602dd81925c2435aaf7866e970b89b8fc2a7939",
            "washpowders": [
                "5417814d66cec4c84e2c878b87d4d0d2"
            ],
            "size": 582,
            "selected": false,
            "app": "微博",
            "icon": "http://image.jndroid.com/lego/app/icon/weibo.jpeg",
            "latest_text": "你简单，世界就是童话;心复杂，世界就是迷宫。||{\"src\":\"http://ww2.sinaimg.cn/large/bdc1323cgw1erbcadsofxj20c80cvjsa.jpg\"}",
            "price": 0
      }]
    }

11.删除用户购买的某个语料块
GET:
    http://user.api.jndroid.com/legobrick/del?uid=25543&lego_brick_id=3

RES:
    {
      "err_no": 0,
    }


1001:该手机号已经注册过
1002:验证码未获取或已经失效
1003:验证码不正确
1004:输入的密码不正确
1005:该手机号的用户不存在
1006:60秒防刷