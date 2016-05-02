const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const helper = require('../../helper/func');
const assign = require('deep-assign');
const redisClient = require('../../../Util/RedisClient');
const jsonwebtoken = require("jsonwebtoken");
const jwtConf = require('../../../config/jwt');
const M = require('../../../Models/index');

router.use(function (req, res, next) {
  const cookies = req.cookies;
  const sessionId = cookieParser.signedCookie(cookies.sessionId, '1234567890QWERTY');
  const token = cookies.token;

  redisClient.get('sess:' + sessionId, function (err, result) {
    var resultJS = JSON.parse(result);
    var resultData = res.resultData = {};

    if (err) {
      next(err);
    }
    if (!resultJS) {
      next(new Error('Malformed sessionId'));
    }

    if (resultJS.token && !token) {
      next(new Error('Client dont has Token but redis has'));
    }

    function tokenVerify(token, redisToken) {
      return token === redisToken;
    }

    if (resultJS.token && token) {
      var verifyToken = tokenVerify(token, resultJS.token);
      if (!verifyToken) {
        next(new Error('Malformed token'));
      }

      jsonwebtoken.verify(token, jwtConf.secret, function (jwtErr, decoded) {
        // err
        if (jwtErr || !decoded) {
          return next(jwtErr);
        }

        var userObj = {
          id: decoded.id,
          nick: decoded.nick
        };
        // decoded undefined
        M
          .User
          .checkUserLogin(userObj)
          .then(function (user) {
            if (!user) {
              return next(new Error('Malformed jwt payload'));
            }

            assign(resultData, {
              UserStore: {
                user: {
                  id: user.id,
                  nick: user.nick,
                  email: user.email
                },
                trendbox: user.trendbox[0],
                profile: user.profile[0],
                grade: user.grade[0],
                role: user.role[0],
                icon: user,
              },
              LoginStore: {isLogin: true, openLoginModal: false, loginSuccess: true, loginFail: false}
            });
            next(); // User Login!!
          });
      });
    } else {
      assign(resultData, {
        UserStore: {user: null},
        LoginStore: {isLogin: false, openLoginModal: false, loginSuccess: false, loginFail: false}
      });
      next(); // User Not Login!!
    }
  });
});

router.use(function (req, res, next) {
  M
    .Club
    .getGnbMenus()
    .then(function(clubs) {
      console.dir(clubs, {depth: 10});

      assign(res.resultData, {
        GnbStore: {
          gnbMenu: { openSideNow: null, data: clubs }
        }
      });
    })
    .then(function() {
      return M
        .Club
        .getClubMenusById(88)
        .then(function(category) {
          console.log(category);
          next();
        })
    })
});

router.get('/', function (req, res, next) {
  console.log(res.resultData);
  res.json({
    GnbStore: {
      openGnb: false,
      gnbMenu: res.resultData.GnbStore.gnbMenu,
      categoryMenu: {
        categories: [{
          "id": 3,
          "title": "바디/헤어",
          "order": 0,
          "description": "바디/헤어",
          "using": true,
          "category_groups": [
            {
              "using": "1",
              "categories": [
                {
                  "forums": [
                    {
                      "id": 37,
                      "title": "샴푸/린스",
                      "order": "0",
                      "description": "샴푸/린스",
                      "using": "1",
                      "category_id": 11
                    },
                    {
                      "id": 38,
                      "title": "트리트먼트/에센스",
                      "order": "1",
                      "description": "트리트먼스/에센스",
                      "using": "1",
                      "category_id": 11
                    },
                    {
                      "id": 39,
                      "title": "탈모",
                      "order": "2",
                      "description": "탈모",
                      "using": "1",
                      "category_id": 11
                    }
                  ],
                  "using": "1",
                  "id": 11,
                  "order": "0",
                  "title": "헤어케어",
                  "club_category_group_id": 5,
                  "description": "헤어케어"
                },
                {
                  "forums": [
                    {
                      "id": 40,
                      "title": "스타일링",
                      "order": "0",
                      "description": "스타일링",
                      "using": "1",
                      "category_id": 12
                    },
                    {
                      "id": 41,
                      "title": "염색",
                      "order": "1",
                      "description": "염색",
                      "using": "1",
                      "category_id": 12
                    },
                    {
                      "id": 42,
                      "title": "파마",
                      "order": "2",
                      "description": "파마",
                      "using": "1",
                      "category_id": 12
                    }
                  ],
                  "using": "1",
                  "id": 12,
                  "order": "1",
                  "title": "헤어스타일링",
                  "club_category_group_id": 5,
                  "description": "헤어스타일링"
                }
              ],
              "id": 5,
              "title": "헤어",
              "order": "0",
              "club_id": 3,
              "description": "헤어"
            },
            {
              "using": "1",
              "categories": [
                {
                  "forums": [
                    {
                      "id": 43,
                      "title": "바디워시",
                      "order": "0",
                      "description": "바디워시",
                      "using": "1",
                      "category_id": 13
                    },
                    {
                      "id": 44,
                      "title": "청결제",
                      "order": "1",
                      "description": "청결제",
                      "using": "1",
                      "category_id": 13
                    },
                    {
                      "id": 45,
                      "title": "입욕제",
                      "order": "2",
                      "description": "입욕제",
                      "using": "1",
                      "category_id": 13
                    },
                    {
                      "id": 46,
                      "title": "제모용품",
                      "order": "3",
                      "description": "제모용품",
                      "using": "1",
                      "category_id": 13
                    },
                    {
                      "id": 47,
                      "title": "데오드란트",
                      "order": "4",
                      "description": "데오드란트",
                      "using": "1",
                      "category_id": 13
                    },
                    {
                      "id": 48,
                      "title": "태닝용품",
                      "order": "5",
                      "description": "태닝용품",
                      "using": "1",
                      "category_id": 13
                    }
                  ],
                  "using": "1",
                  "id": 13,
                  "order": "0",
                  "title": "바디케어",
                  "club_category_group_id": 6,
                  "description": "바디케어"
                },
                {
                  "forums": [
                    {
                      "id": 49,
                      "title": "바디로션",
                      "order": "0",
                      "description": "바디로션",
                      "using": "1",
                      "category_id": 14
                    },
                    {
                      "id": 50,
                      "title": "핸드풋케어",
                      "order": "1",
                      "description": "핸드풋케어",
                      "using": "1",
                      "category_id": 14
                    },
                    {
                      "id": 51,
                      "title": "립케어",
                      "order": "2",
                      "description": "립케어",
                      "using": "1",
                      "category_id": 14
                    }
                  ],
                  "using": "1",
                  "id": 14,
                  "order": "1",
                  "title": "바디로션/핸드크림",
                  "club_category_group_id": 6,
                  "description": "바디로션/핸드크림"
                },
                {
                  "forums": [
                    {
                      "id": 52,
                      "title": "면도용품",
                      "order": "0",
                      "description": "면도",
                      "using": "1",
                      "category_id": 15
                    },
                    {
                      "id": 53,
                      "title": "칫솔",
                      "order": "1",
                      "description": "칫솔",
                      "using": "1",
                      "category_id": 15
                    },
                    {
                      "id": 54,
                      "title": "비누",
                      "order": "2",
                      "description": "비누",
                      "using": "1",
                      "category_id": 15
                    }
                  ],
                  "using": "1",
                  "id": 15,
                  "order": "2",
                  "title": "세면",
                  "club_category_group_id": 6,
                  "description": "세면"
                }
              ],
              "id": 6,
              "title": "바디",
              "order": "1",
              "club_id": 3,
              "description": "바디"
            }
          ]
        }]
      }
    },
    LoginStore: res.resultData.LoginStore,
    UserStore: {
      user: res.resultData.UserStore.user,
      trendbox: res.resultData.UserStore.trendbox,
      profile: res.resultData.UserStore.profile,
      icon: {
        id: 1,
        img: 'icon_1.png'
      },
      grade: {
        name: '브론즈',
        img: 'grade_bronze.png'
      }
    },
    BestPostStore: {
      posts: {
        data: [
          {
            id: 1,
            title: '트랜드 클리어를 소개합니다',
            content: '<p>대통령후보자가 1인일 때에는 그 득표수가 선거권자 총수의 3분의 1 이상이 아니면 대통령으로 당선될 수 없다. 모든 국민은 근로의 권리를 가진다. 국가는 사회적·경제적 방법으로 근로자의 고용의 증진과 적정임금의 보장에 노력하여야 하며, 법률이 정하는 바에 의하여 최저임금제를 시행하여야 한다.</p> <p>사면·감형 및 복권에 관한 사항은 법률로 정한다. 모든 국민은 법 앞에 평등하다. 누구든지 성별·종교 또는 사회적 신분에 의하여 정치적·경제적·사회적·문화적 생활의 모든 영역에 있어서 차별을 받지 아니한다. 대통령은 헌법과 법률이 정하는 바에 의하여 국군을 통수한다. 국회의원은 그 지위를 남용하여 국가·공공단체 또는 기업체와의 계약이나 그 처분에 의하여 재산상의 권리·이익 또는 직위를 취득하거나 타인을 위하여 그 취득을 알선할 수 없다.</p> <p>모든 국민은 법률이 정하는 바에 의하여 납세의 의무를 진다. 국가는 농수산물의 수급균형과 유통구조의 개선에 노력하여 가격안정을 도모함으로써 농·어민의 이익을 보호한다. 각급 선거관리위원회는 선거인명부의 작성등 선거사무와 국민투표사무에 관하여 관계 행정기관에 필요한 지시를 할 수 있다.</p> <p>지방자치단체는 주민의 복리에 관한 사무를 처리하고 재산을 관리하며, 법령의 범위안에서 자치에 관한 규정을 제정할 수 있다. 사회적 특수계급의 제도는 인정되지 아니하며, 어떠한 형태로도 이를 창설할 수 없다. 국가는 주택개발정책등을 통하여 모든 국민이 쾌적한 주거생활을 할 수 있도록 노력하여야 한다.</p> <p>법률안에 이의가 있을 때에는 대통령은 제1항의 기간내에 이의서를 붙여 국회로 환부하고, 그 재의를 요구할 수 있다. 국회의 폐회중에도 또한 같다. 정당의 설립은 자유이며, 복수정당제는 보장된다. 대통령은 제3항과 제4항의 사유를 지체없이 공포하여야 한다. 대통령이 궐위되거나 사고로 인하여 직무를 수행할 수 없을 때에는 국무총리, 법률이 정한 국무위원의 순서로 그 권한을 대행한다.</p> <p>행정각부의 설치·조직과 직무범위는 법률로 정한다. 국가안전보장회의의 조직·직무범위 기타 필요한 사항은 법률로 정한다. 원장은 국회의 동의를 얻어 대통령이 임명하고, 그 임기는 4년으로 하며, 1차에 한하여 중임할 수 있다. 모든 국민은 학문과 예술의 자유를 가진다. 모든 국민은 그 보호하는 자녀에게 적어도 초등교육과 법률이 정하는 교육을 받게 할 의무를 진다.</p> <p>혼인과 가족생활은 개인의 존엄과 양성의 평등을 기초로 성립되고 유지되어야 하며, 국가는 이를 보장한다. 모든 국민은 인간다운 생활을 할 권리를 가진다. 국무총리 또는 행정각부의 장은 소관사무에 관하여 법률이나 대통령령의 위임 또는 직권으로 총리령 또는 부령을 발할 수 있다. 대법원과 각급법원의 조직은 법률로 정한다.</p> <p>대통령은 법률안의 일부에 대하여 또는 법률안을 수정하여 재의를 요구할 수 없다. 사법권은 법관으로 구성된 법원에 속한다. 재산권의 행사는 공공복리에 적합하도록 하여야 한다. 신체장애자 및 질병·노령 기타의 사유로 생활능력이 없는 국민은 법률이 정하는 바에 의하여 국가의 보호를 받는다. 국무위원은 국무총리의 제청으로 대통령이 임명한다.</p>',
            author: {
              nick: 'Destiny',
              icon: {
                img: 'icon_1.png'
              },
              sex: 1,
              avatar_img: null
            },
            categories: {
              club: {
                title: '헤어',
                category: {
                  title: '탈모',
                  forum: {
                    title: '탈모치료제'
                  }
                }
              }
            },
            created_at: '2016-12-12 13:23',
            view_count: '1,232',
            like_count: '1,232',
            comment_count: '322'
          },
          {
            id: 2,
            title: '트랜드 클리어를 소개합니다2',
            content: '<p>대통령후보자가 1인일 때에는 그 득표수가 선거권자 총수의 3분의 1 이상이 아니면 대통령으로 당선될 수 없다. 모든 국민은 근로의 권리를 가진다. 국가는 사회적·경제적 방법으로 근로자의 고용의 증진과 적정임금의 보장에 노력하여야 하며, 법률이 정하는 바에 의하여 최저임금제를 시행하여야 한다.</p> <p>사면·감형 및 복권에 관한 사항은 법률로 정한다. 모든 국민은 법 앞에 평등하다. 누구든지 성별·종교 또는 사회적 신분에 의하여 정치적·경제적·사회적·문화적 생활의 모든 영역에 있어서 차별을 받지 아니한다. 대통령은 헌법과 법률이 정하는 바에 의하여 국군을 통수한다. 국회의원은 그 지위를 남용하여 국가·공공단체 또는 기업체와의 계약이나 그 처분에 의하여 재산상의 권리·이익 또는 직위를 취득하거나 타인을 위하여 그 취득을 알선할 수 없다.</p> <p>모든 국민은 법률이 정하는 바에 의하여 납세의 의무를 진다. 국가는 농수산물의 수급균형과 유통구조의 개선에 노력하여 가격안정을 도모함으로써 농·어민의 이익을 보호한다. 각급 선거관리위원회는 선거인명부의 작성등 선거사무와 국민투표사무에 관하여 관계 행정기관에 필요한 지시를 할 수 있다.</p> <p>지방자치단체는 주민의 복리에 관한 사무를 처리하고 재산을 관리하며, 법령의 범위안에서 자치에 관한 규정을 제정할 수 있다. 사회적 특수계급의 제도는 인정되지 아니하며, 어떠한 형태로도 이를 창설할 수 없다. 국가는 주택개발정책등을 통하여 모든 국민이 쾌적한 주거생활을 할 수 있도록 노력하여야 한다.</p> <p>법률안에 이의가 있을 때에는 대통령은 제1항의 기간내에 이의서를 붙여 국회로 환부하고, 그 재의를 요구할 수 있다. 국회의 폐회중에도 또한 같다. 정당의 설립은 자유이며, 복수정당제는 보장된다. 대통령은 제3항과 제4항의 사유를 지체없이 공포하여야 한다. 대통령이 궐위되거나 사고로 인하여 직무를 수행할 수 없을 때에는 국무총리, 법률이 정한 국무위원의 순서로 그 권한을 대행한다.</p> <p>행정각부의 설치·조직과 직무범위는 법률로 정한다. 국가안전보장회의의 조직·직무범위 기타 필요한 사항은 법률로 정한다. 원장은 국회의 동의를 얻어 대통령이 임명하고, 그 임기는 4년으로 하며, 1차에 한하여 중임할 수 있다. 모든 국민은 학문과 예술의 자유를 가진다. 모든 국민은 그 보호하는 자녀에게 적어도 초등교육과 법률이 정하는 교육을 받게 할 의무를 진다.</p> <p>혼인과 가족생활은 개인의 존엄과 양성의 평등을 기초로 성립되고 유지되어야 하며, 국가는 이를 보장한다. 모든 국민은 인간다운 생활을 할 권리를 가진다. 국무총리 또는 행정각부의 장은 소관사무에 관하여 법률이나 대통령령의 위임 또는 직권으로 총리령 또는 부령을 발할 수 있다. 대법원과 각급법원의 조직은 법률로 정한다.</p> <p>대통령은 법률안의 일부에 대하여 또는 법률안을 수정하여 재의를 요구할 수 없다. 사법권은 법관으로 구성된 법원에 속한다. 재산권의 행사는 공공복리에 적합하도록 하여야 한다. 신체장애자 및 질병·노령 기타의 사유로 생활능력이 없는 국민은 법률이 정하는 바에 의하여 국가의 보호를 받는다. 국무위원은 국무총리의 제청으로 대통령이 임명한다.</p>',
            author: {
              nick: 'Destiny',
              icon: {
                img: 'icon_1.png'
              },
              sex: 1,
              avatar_img: null
            },
            categories: {
              club: {
                title: '헤어',
                category: {
                  title: '탈모',
                  forum: {
                    title: '탈모치료제'
                  }
                }
              }
            },
            created_at: '2016-12-12 13:23',
            view_count: '1,232',
            like_count: '1,232',
            comment_count: '322'
          }
        ],
        collection: {
          current_page: 1,
          limit: 10,
          next_page: 2,
          total: 20
        }
      }
    },
    SigninStore: {
      emailDup: null,
      nickDup: null,
      emailRequested: null,
      submitResult: false,
      emailVerifySuccess: false,
      emailVerifyFail: false
    },
    CommunityStore: {
      type: null,
      club: {
        "id": 1,
        "order": 0,
        "title": "공지사항",
        "created_at": "2016-04-27T08:02:49.000Z",
        "ClubGroup": {
          "using": true,
          "id": 1,
          "created_at": "2016-04-27T08:02:49.000Z",
          "title": "공지",
          "order": 0,
          "user_id": 1,
          "description": "공지게시판 입니다",
          "updated_at": "2016-04-27T08:02:49.000Z"
        },
        "club_group_id": 1,
        "description": "공지게시판 입니다",
        "user_id": 1,
        "updated_at": "2016-04-27T08:02:49.000Z",
        "url": "notice"
      },
      list: {
        page: 0,
        data: [],
        total: 0,
        limit: 0
      }
    }
  });
});

router.get('/community', function (req, res, next) {
  const prop = {
    categoryId: req.query.categoryId,
    forumId: req.query.forumId,
    postId: req.query.postId
  };

  if (prop.categoryId && prop.forumId && prop.postId) {
    res.json({
      CommunityStore: {
        type: 'post',
        post: {
          id: 1,
          title: '트랜드 클리어를 소개합니다',
          content: '<p>대통령후보자가 1인일 때에는 그 득표수가 선거권자 총수의 3분의 1 이상이 아니면 대통령으로 당선될 수 없다. 모든 국민은 근로의 권리를 가진다. 국가는 사회적·경제적 방법으로 근로자의 고용의 증진과 적정임금의 보장에 노력하여야 하며, 법률이 정하는 바에 의하여 최저임금제를 시행하여야 한다.</p> <p>사면·감형 및 복권에 관한 사항은 법률로 정한다. 모든 국민은 법 앞에 평등하다. 누구든지 성별·종교 또는 사회적 신분에 의하여 정치적·경제적·사회적·문화적 생활의 모든 영역에 있어서 차별을 받지 아니한다. 대통령은 헌법과 법률이 정하는 바에 의하여 국군을 통수한다. 국회의원은 그 지위를 남용하여 국가·공공단체 또는 기업체와의 계약이나 그 처분에 의하여 재산상의 권리·이익 또는 직위를 취득하거나 타인을 위하여 그 취득을 알선할 수 없다.</p> <p>모든 국민은 법률이 정하는 바에 의하여 납세의 의무를 진다. 국가는 농수산물의 수급균형과 유통구조의 개선에 노력하여 가격안정을 도모함으로써 농·어민의 이익을 보호한다. 각급 선거관리위원회는 선거인명부의 작성등 선거사무와 국민투표사무에 관하여 관계 행정기관에 필요한 지시를 할 수 있다.</p> <p>지방자치단체는 주민의 복리에 관한 사무를 처리하고 재산을 관리하며, 법령의 범위안에서 자치에 관한 규정을 제정할 수 있다. 사회적 특수계급의 제도는 인정되지 아니하며, 어떠한 형태로도 이를 창설할 수 없다. 국가는 주택개발정책등을 통하여 모든 국민이 쾌적한 주거생활을 할 수 있도록 노력하여야 한다.</p> <p>법률안에 이의가 있을 때에는 대통령은 제1항의 기간내에 이의서를 붙여 국회로 환부하고, 그 재의를 요구할 수 있다. 국회의 폐회중에도 또한 같다. 정당의 설립은 자유이며, 복수정당제는 보장된다. 대통령은 제3항과 제4항의 사유를 지체없이 공포하여야 한다. 대통령이 궐위되거나 사고로 인하여 직무를 수행할 수 없을 때에는 국무총리, 법률이 정한 국무위원의 순서로 그 권한을 대행한다.</p> <p>행정각부의 설치·조직과 직무범위는 법률로 정한다. 국가안전보장회의의 조직·직무범위 기타 필요한 사항은 법률로 정한다. 원장은 국회의 동의를 얻어 대통령이 임명하고, 그 임기는 4년으로 하며, 1차에 한하여 중임할 수 있다. 모든 국민은 학문과 예술의 자유를 가진다. 모든 국민은 그 보호하는 자녀에게 적어도 초등교육과 법률이 정하는 교육을 받게 할 의무를 진다.</p> <p>혼인과 가족생활은 개인의 존엄과 양성의 평등을 기초로 성립되고 유지되어야 하며, 국가는 이를 보장한다. 모든 국민은 인간다운 생활을 할 권리를 가진다. 국무총리 또는 행정각부의 장은 소관사무에 관하여 법률이나 대통령령의 위임 또는 직권으로 총리령 또는 부령을 발할 수 있다. 대법원과 각급법원의 조직은 법률로 정한다.</p> <p>대통령은 법률안의 일부에 대하여 또는 법률안을 수정하여 재의를 요구할 수 없다. 사법권은 법관으로 구성된 법원에 속한다. 재산권의 행사는 공공복리에 적합하도록 하여야 한다. 신체장애자 및 질병·노령 기타의 사유로 생활능력이 없는 국민은 법률이 정하는 바에 의하여 국가의 보호를 받는다. 국무위원은 국무총리의 제청으로 대통령이 임명한다.</p>',
          author: {
            nick: 'Destiny',
            icon: {
              img: 'icon_1.png'
            },
            sex: 1,
            avatar_img: null
          },
          categories: {
            club: {
              title: '헤어',
              category: {
                title: '탈모',
                forum: {
                  title: '탈모치료제'
                }
              }
            }
          },
          created_at: '2016-12-12 13:23',
          view_count: '1,232',
          like_count: '1,232',
          comment_count: '322'
        },
        "club": {
          "id": 1,
          "order": 0,
          "title": "공지사항",
          "created_at": "2016-04-27T08:02:49.000Z",
          "ClubGroup": {
            "using": true,
            "id": 1,
            "created_at": "2016-04-27T08:02:49.000Z",
            "title": "공지",
            "order": 0,
            "user_id": 1,
            "description": "공지게시판 입니다",
            "updated_at": "2016-04-27T08:02:49.000Z"
          },
          "club_group_id": 1,
          "description": "공지게시판 입니다",
          "user_id": 1,
          "updated_at": "2016-04-27T08:02:49.000Z",
          "url": "notice"
        },
        "list": {
          "page": 1,
          "data": [
            {
              "id": 325,
              "comment_count": 50,
              "Prefix": null,
              "prefix_id": null,
              "User": {
                "nick": "고블린클럽"
              },
              "club_id": 1,
              "created_at": "3분 전",
              "Club": {
                "title": "공지사항",
                "url": "notice"
              },
              "user_id": 1,
              "has_img": false,
              "title": "The title 19",
              "view_count": 0,
              "deleted": false,
              "like_count": 0,
              "updated_at": "3분 전",
              "has_video": false,
              "content": "content19"
            },
            {
              "id": 308,
              "comment_count": 50,
              "Prefix": null,
              "prefix_id": null,
              "User": {
                "nick": "고블린클럽"
              },
              "club_id": 1,
              "created_at": "3분 전",
              "Club": {
                "title": "공지사항",
                "url": "notice"
              },
              "user_id": 1,
              "has_img": false,
              "title": "The title 18",
              "view_count": 0,
              "deleted": false,
              "like_count": 0,
              "updated_at": "3분 전",
              "has_video": false,
              "content": "content18"
            },
            {
              "id": 291,
              "comment_count": 50,
              "Prefix": null,
              "prefix_id": null,
              "User": {
                "nick": "고블린클럽"
              },
              "club_id": 1,
              "created_at": "3분 전",
              "Club": {
                "title": "공지사항",
                "url": "notice"
              },
              "user_id": 1,
              "has_img": false,
              "title": "The title 17",
              "view_count": 0,
              "deleted": false,
              "like_count": 0,
              "updated_at": "3분 전",
              "has_video": false,
              "content": "content17"
            },
            {
              "id": 274,
              "comment_count": 50,
              "Prefix": null,
              "prefix_id": null,
              "User": {
                "nick": "고블린클럽"
              },
              "club_id": 1,
              "created_at": "3분 전",
              "Club": {
                "title": "공지사항",
                "url": "notice"
              },
              "user_id": 1,
              "has_img": false,
              "title": "The title 16",
              "view_count": 0,
              "deleted": false,
              "like_count": 0,
              "updated_at": "3분 전",
              "has_video": false,
              "content": "content16"
            },
            {
              "id": 257,
              "comment_count": 50,
              "Prefix": null,
              "prefix_id": null,
              "User": {
                "nick": "고블린클럽"
              },
              "club_id": 1,
              "created_at": "3분 전",
              "Club": {
                "title": "공지사항",
                "url": "notice"
              },
              "user_id": 1,
              "has_img": false,
              "title": "The title 15",
              "view_count": 0,
              "deleted": false,
              "like_count": 0,
              "updated_at": "3분 전",
              "has_video": false,
              "content": "content15"
            },
            {
              "id": 240,
              "comment_count": 50,
              "Prefix": null,
              "prefix_id": null,
              "User": {
                "nick": "고블린클럽"
              },
              "club_id": 1,
              "created_at": "3분 전",
              "Club": {
                "title": "공지사항",
                "url": "notice"
              },
              "user_id": 1,
              "has_img": false,
              "title": "The title 14",
              "view_count": 0,
              "deleted": false,
              "like_count": 0,
              "updated_at": "3분 전",
              "has_video": false,
              "content": "content14"
            },
            {
              "id": 223,
              "comment_count": 50,
              "Prefix": null,
              "prefix_id": null,
              "User": {
                "nick": "고블린클럽"
              },
              "club_id": 1,
              "created_at": "3분 전",
              "Club": {
                "title": "공지사항",
                "url": "notice"
              },
              "user_id": 1,
              "has_img": false,
              "title": "The title 13",
              "view_count": 0,
              "deleted": false,
              "like_count": 0,
              "updated_at": "3분 전",
              "has_video": false,
              "content": "content13"
            },
            {
              "id": 206,
              "comment_count": 50,
              "Prefix": null,
              "prefix_id": null,
              "User": {
                "nick": "고블린클럽"
              },
              "club_id": 1,
              "created_at": "3분 전",
              "Club": {
                "title": "공지사항",
                "url": "notice"
              },
              "user_id": 1,
              "has_img": false,
              "title": "The title 12",
              "view_count": 0,
              "deleted": false,
              "like_count": 0,
              "updated_at": "3분 전",
              "has_video": false,
              "content": "content12"
            },
            {
              "id": 189,
              "comment_count": 50,
              "Prefix": null,
              "prefix_id": null,
              "User": {
                "nick": "고블린클럽"
              },
              "club_id": 1,
              "created_at": "3분 전",
              "Club": {
                "title": "공지사항",
                "url": "notice"
              },
              "user_id": 1,
              "has_img": false,
              "title": "The title 11",
              "view_count": 0,
              "deleted": false,
              "like_count": 0,
              "updated_at": "3분 전",
              "has_video": false,
              "content": "content11"
            },
            {
              "id": 172,
              "comment_count": 50,
              "Prefix": null,
              "prefix_id": null,
              "User": {
                "nick": "고블린클럽"
              },
              "club_id": 1,
              "created_at": "3분 전",
              "Club": {
                "title": "공지사항",
                "url": "notice"
              },
              "user_id": 1,
              "has_img": false,
              "title": "The title 10",
              "view_count": 0,
              "deleted": false,
              "like_count": 0,
              "updated_at": "3분 전",
              "has_video": false,
              "content": "content10"
            }
          ],
          "total": 21,
          "limit": 10
        }
      },
      GnbStore: {
        openGnb: false,
        gnbMenu: {
          openSideNow: null,
          data: [
            {
              "id": 1,
              "title": "바디/헤어",
              "order": 0,
              "description": "바디/헤어",
              "using": true,
              "category_groups": [
                {
                  "using": "1",
                  "categories": [
                    {
                      "forums": [
                        {
                          "using": "1",
                          "id": 1,
                          "order": "0",
                          "title": "샴푸/린스",
                          "category_id": 1,
                          "prefixes": [
                            {
                              "id": 1,
                              "name": "기능성 샴푸",
                              "forum_id": 1
                            },
                            {
                              "id": 2,
                              "name": "한방 샴푸",
                              "forum_id": 1
                            }
                          ],
                          "description": "샴푸/린스"
                        },
                        {
                          "using": "1",
                          "id": 2,
                          "order": "1",
                          "title": "트리트먼트/에센스",
                          "category_id": 1,
                          "prefixes": [],
                          "description": "트리트먼스/에센스"
                        },
                        {
                          "using": "1",
                          "id": 3,
                          "order": "2",
                          "title": "탈모",
                          "category_id": 1,
                          "prefixes": [],
                          "description": "탈모"
                        }
                      ],
                      "using": "1",
                      "id": 1,
                      "order": "0",
                      "title": "헤어케어",
                      "club_category_group_id": 1,
                      "description": "헤어케어"
                    },
                    {
                      "forums": [
                        {
                          "using": "1",
                          "id": 4,
                          "order": "0",
                          "title": "스타일링",
                          "category_id": 2,
                          "prefixes": [],
                          "description": "스타일링"
                        },
                        {
                          "using": "1",
                          "id": 5,
                          "order": "1",
                          "title": "염색",
                          "category_id": 2,
                          "prefixes": [],
                          "description": "염색"
                        },
                        {
                          "using": "1",
                          "id": 6,
                          "order": "2",
                          "title": "파마",
                          "category_id": 2,
                          "prefixes": [],
                          "description": "파마"
                        }
                      ],
                      "using": "1",
                      "id": 2,
                      "order": "1",
                      "title": "헤어스타일링",
                      "club_category_group_id": 1,
                      "description": "헤어스타일링"
                    }
                  ],
                  "id": 1,
                  "title": "헤어",
                  "order": "0",
                  "club_id": 1,
                  "description": "헤어"
                },
                {
                  "using": "1",
                  "categories": [
                    {
                      "forums": [
                        {
                          "using": "1",
                          "id": 7,
                          "order": "0",
                          "title": "바디워시",
                          "category_id": 3,
                          "prefixes": [],
                          "description": "바디워시"
                        },
                        {
                          "using": "1",
                          "id": 8,
                          "order": "1",
                          "title": "청결제",
                          "category_id": 3,
                          "prefixes": [],
                          "description": "청결제"
                        },
                        {
                          "using": "1",
                          "id": 9,
                          "order": "2",
                          "title": "입욕제",
                          "category_id": 3,
                          "prefixes": [],
                          "description": "입욕제"
                        },
                        {
                          "using": "1",
                          "id": 10,
                          "order": "3",
                          "title": "제모용품",
                          "category_id": 3,
                          "prefixes": [],
                          "description": "제모용품"
                        },
                        {
                          "using": "1",
                          "id": 11,
                          "order": "4",
                          "title": "데오드란트",
                          "category_id": 3,
                          "prefixes": [],
                          "description": "데오드란트"
                        },
                        {
                          "using": "1",
                          "id": 12,
                          "order": "5",
                          "title": "태닝용품",
                          "category_id": 3,
                          "prefixes": [],
                          "description": "태닝용품"
                        }
                      ],
                      "using": "1",
                      "id": 3,
                      "order": "0",
                      "title": "바디케어",
                      "club_category_group_id": 2,
                      "description": "바디케어"
                    },
                    {
                      "forums": [
                        {
                          "using": "1",
                          "id": 13,
                          "order": "0",
                          "title": "바디로션",
                          "category_id": 4,
                          "prefixes": [],
                          "description": "바디로션"
                        },
                        {
                          "using": "1",
                          "id": 14,
                          "order": "1",
                          "title": "핸드풋케어",
                          "category_id": 4,
                          "prefixes": [],
                          "description": "핸드풋케어"
                        },
                        {
                          "using": "1",
                          "id": 15,
                          "order": "2",
                          "title": "립케어",
                          "category_id": 4,
                          "prefixes": [],
                          "description": "립케어"
                        }
                      ],
                      "using": "1",
                      "id": 4,
                      "order": "1",
                      "title": "바디로션/핸드크림",
                      "club_category_group_id": 2,
                      "description": "바디로션/핸드크림"
                    },
                    {
                      "forums": [
                        {
                          "using": "1",
                          "id": 16,
                          "order": "0",
                          "title": "면도용품",
                          "category_id": 5,
                          "prefixes": [],
                          "description": "면도"
                        },
                        {
                          "using": "1",
                          "id": 17,
                          "order": "1",
                          "title": "칫솔",
                          "category_id": 5,
                          "prefixes": [],
                          "description": "칫솔"
                        },
                        {
                          "using": "1",
                          "id": 18,
                          "order": "2",
                          "title": "비누",
                          "category_id": 5,
                          "prefixes": [],
                          "description": "비누"
                        }
                      ],
                      "using": "1",
                      "id": 5,
                      "order": "2",
                      "title": "세면",
                      "club_category_group_id": 2,
                      "description": "세면"
                    }
                  ],
                  "id": 2,
                  "title": "바디",
                  "order": "1",
                  "club_id": 1,
                  "description": "바디"
                }
              ]
            },
            {
              "id": 2,
              "title": "탈모",
              "order": 0,
              "description": "바디/헤어",
              "using": true,
              "category_groups": [
                {
                  "using": "1",
                  "categories": [
                    {
                      "forums": [
                        {
                          "using": "1",
                          "id": 1,
                          "order": "0",
                          "title": "샴푸/린스",
                          "category_id": 1,
                          "prefixes": [
                            {
                              "id": 1,
                              "name": "기능성 샴푸",
                              "forum_id": 1
                            },
                            {
                              "id": 2,
                              "name": "한방 샴푸",
                              "forum_id": 1
                            }
                          ],
                          "description": "샴푸/린스"
                        },
                        {
                          "using": "1",
                          "id": 2,
                          "order": "1",
                          "title": "트리트먼트/에센스",
                          "category_id": 1,
                          "prefixes": [],
                          "description": "트리트먼스/에센스"
                        },
                        {
                          "using": "1",
                          "id": 3,
                          "order": "2",
                          "title": "탈모",
                          "category_id": 1,
                          "prefixes": [],
                          "description": "탈모"
                        }
                      ],
                      "using": "1",
                      "id": 1,
                      "order": "0",
                      "title": "탈모케어",
                      "club_category_group_id": 1,
                      "description": "헤어케어"
                    },
                    {
                      "forums": [
                        {
                          "using": "1",
                          "id": 4,
                          "order": "0",
                          "title": "스타일링",
                          "category_id": 2,
                          "prefixes": [],
                          "description": "스타일링"
                        },
                        {
                          "using": "1",
                          "id": 5,
                          "order": "1",
                          "title": "염색",
                          "category_id": 2,
                          "prefixes": [],
                          "description": "염색"
                        },
                        {
                          "using": "1",
                          "id": 6,
                          "order": "2",
                          "title": "파마",
                          "category_id": 2,
                          "prefixes": [],
                          "description": "파마"
                        }
                      ],
                      "using": "1",
                      "id": 2,
                      "order": "1",
                      "title": "헤어스타일링",
                      "club_category_group_id": 1,
                      "description": "헤어스타일링"
                    }
                  ],
                  "id": 1,
                  "title": "헤어",
                  "order": "0",
                  "club_id": 1,
                  "description": "헤어"
                },
                {
                  "using": "1",
                  "categories": [
                    {
                      "forums": [
                        {
                          "using": "1",
                          "id": 7,
                          "order": "0",
                          "title": "바디워시",
                          "category_id": 3,
                          "prefixes": [],
                          "description": "바디워시"
                        },
                        {
                          "using": "1",
                          "id": 8,
                          "order": "1",
                          "title": "청결제",
                          "category_id": 3,
                          "prefixes": [],
                          "description": "청결제"
                        },
                        {
                          "using": "1",
                          "id": 9,
                          "order": "2",
                          "title": "입욕제",
                          "category_id": 3,
                          "prefixes": [],
                          "description": "입욕제"
                        },
                        {
                          "using": "1",
                          "id": 10,
                          "order": "3",
                          "title": "제모용품",
                          "category_id": 3,
                          "prefixes": [],
                          "description": "제모용품"
                        },
                        {
                          "using": "1",
                          "id": 11,
                          "order": "4",
                          "title": "데오드란트",
                          "category_id": 3,
                          "prefixes": [],
                          "description": "데오드란트"
                        },
                        {
                          "using": "1",
                          "id": 12,
                          "order": "5",
                          "title": "태닝용품",
                          "category_id": 3,
                          "prefixes": [],
                          "description": "태닝용품"
                        }
                      ],
                      "using": "1",
                      "id": 3,
                      "order": "0",
                      "title": "바디케어",
                      "club_category_group_id": 2,
                      "description": "바디케어"
                    },
                    {
                      "forums": [
                        {
                          "using": "1",
                          "id": 13,
                          "order": "0",
                          "title": "바디로션",
                          "category_id": 4,
                          "prefixes": [],
                          "description": "바디로션"
                        },
                        {
                          "using": "1",
                          "id": 14,
                          "order": "1",
                          "title": "핸드풋케어",
                          "category_id": 4,
                          "prefixes": [],
                          "description": "핸드풋케어"
                        },
                        {
                          "using": "1",
                          "id": 15,
                          "order": "2",
                          "title": "립케어",
                          "category_id": 4,
                          "prefixes": [],
                          "description": "립케어"
                        }
                      ],
                      "using": "1",
                      "id": 4,
                      "order": "1",
                      "title": "바디로션/핸드크림",
                      "club_category_group_id": 2,
                      "description": "바디로션/핸드크림"
                    },
                    {
                      "forums": [
                        {
                          "using": "1",
                          "id": 16,
                          "order": "0",
                          "title": "면도용품",
                          "category_id": 5,
                          "prefixes": [],
                          "description": "면도"
                        },
                        {
                          "using": "1",
                          "id": 17,
                          "order": "1",
                          "title": "칫솔",
                          "category_id": 5,
                          "prefixes": [],
                          "description": "칫솔"
                        },
                        {
                          "using": "1",
                          "id": 18,
                          "order": "2",
                          "title": "비누",
                          "category_id": 5,
                          "prefixes": [],
                          "description": "비누"
                        }
                      ],
                      "using": "1",
                      "id": 5,
                      "order": "2",
                      "title": "세면",
                      "club_category_group_id": 2,
                      "description": "세면"
                    }
                  ],
                  "id": 2,
                  "title": "바디",
                  "order": "1",
                  "club_id": 1,
                  "description": "바디"
                }
              ]
            }
          ]
        },
        categoryMenu: {
          categories: [{
            "id": 3,
            "title": "바디/헤어",
            "order": 0,
            "description": "바디/헤어",
            "using": true,
            "category_groups": [
              {
                "using": "1",
                "categories": [
                  {
                    "forums": [
                      {
                        "id": 37,
                        "title": "샴푸/린스",
                        "order": "0",
                        "description": "샴푸/린스",
                        "using": "1",
                        "category_id": 11
                      },
                      {
                        "id": 38,
                        "title": "트리트먼트/에센스",
                        "order": "1",
                        "description": "트리트먼스/에센스",
                        "using": "1",
                        "category_id": 11
                      },
                      {
                        "id": 39,
                        "title": "탈모",
                        "order": "2",
                        "description": "탈모",
                        "using": "1",
                        "category_id": 11
                      }
                    ],
                    "using": "1",
                    "id": 11,
                    "order": "0",
                    "title": "헤어케어",
                    "club_category_group_id": 5,
                    "description": "헤어케어"
                  },
                  {
                    "forums": [
                      {
                        "id": 40,
                        "title": "스타일링",
                        "order": "0",
                        "description": "스타일링",
                        "using": "1",
                        "category_id": 12
                      },
                      {
                        "id": 41,
                        "title": "염색",
                        "order": "1",
                        "description": "염색",
                        "using": "1",
                        "category_id": 12
                      },
                      {
                        "id": 42,
                        "title": "파마",
                        "order": "2",
                        "description": "파마",
                        "using": "1",
                        "category_id": 12
                      }
                    ],
                    "using": "1",
                    "id": 12,
                    "order": "1",
                    "title": "헤어스타일링",
                    "club_category_group_id": 5,
                    "description": "헤어스타일링"
                  }
                ],
                "id": 5,
                "title": "헤어",
                "order": "0",
                "club_id": 3,
                "description": "헤어"
              },
              {
                "using": "1",
                "categories": [
                  {
                    "forums": [
                      {
                        "id": 43,
                        "title": "바디워시",
                        "order": "0",
                        "description": "바디워시",
                        "using": "1",
                        "category_id": 13
                      },
                      {
                        "id": 44,
                        "title": "청결제",
                        "order": "1",
                        "description": "청결제",
                        "using": "1",
                        "category_id": 13
                      },
                      {
                        "id": 45,
                        "title": "입욕제",
                        "order": "2",
                        "description": "입욕제",
                        "using": "1",
                        "category_id": 13
                      },
                      {
                        "id": 46,
                        "title": "제모용품",
                        "order": "3",
                        "description": "제모용품",
                        "using": "1",
                        "category_id": 13
                      },
                      {
                        "id": 47,
                        "title": "데오드란트",
                        "order": "4",
                        "description": "데오드란트",
                        "using": "1",
                        "category_id": 13
                      },
                      {
                        "id": 48,
                        "title": "태닝용품",
                        "order": "5",
                        "description": "태닝용품",
                        "using": "1",
                        "category_id": 13
                      }
                    ],
                    "using": "1",
                    "id": 13,
                    "order": "0",
                    "title": "바디케어",
                    "club_category_group_id": 6,
                    "description": "바디케어"
                  },
                  {
                    "forums": [
                      {
                        "id": 49,
                        "title": "바디로션",
                        "order": "0",
                        "description": "바디로션",
                        "using": "1",
                        "category_id": 14
                      },
                      {
                        "id": 50,
                        "title": "핸드풋케어",
                        "order": "1",
                        "description": "핸드풋케어",
                        "using": "1",
                        "category_id": 14
                      },
                      {
                        "id": 51,
                        "title": "립케어",
                        "order": "2",
                        "description": "립케어",
                        "using": "1",
                        "category_id": 14
                      }
                    ],
                    "using": "1",
                    "id": 14,
                    "order": "1",
                    "title": "바디로션/핸드크림",
                    "club_category_group_id": 6,
                    "description": "바디로션/핸드크림"
                  },
                  {
                    "forums": [
                      {
                        "id": 52,
                        "title": "면도용품",
                        "order": "0",
                        "description": "면도",
                        "using": "1",
                        "category_id": 15
                      },
                      {
                        "id": 53,
                        "title": "칫솔",
                        "order": "1",
                        "description": "칫솔",
                        "using": "1",
                        "category_id": 15
                      },
                      {
                        "id": 54,
                        "title": "비누",
                        "order": "2",
                        "description": "비누",
                        "using": "1",
                        "category_id": 15
                      }
                    ],
                    "using": "1",
                    "id": 15,
                    "order": "2",
                    "title": "세면",
                    "club_category_group_id": 6,
                    "description": "세면"
                  }
                ],
                "id": 6,
                "title": "바디",
                "order": "1",
                "club_id": 3,
                "description": "바디"
              }
            ]
          }]
        }
      },
      LoginStore: res.resultData.LoginStore,
      UserStore: {
        user: res.resultData.UserStore.user,
        trendbox: res.resultData.UserStore.trendbox,
        profile: res.resultData.UserStore.profile,
        icon: {
          id: 1,
          img: 'icon_1.png'
        },
        grade: {
          name: '브론즈',
          img: 'grade_bronze.png'
        }
      },
      SigninStore: {
        emailDup: null,
        nickDup: null,
        emailRequested: null,
        submitResult: false,
        emailVerifySuccess: false,
        emailVerifyFail: false
      },
      BestPostStore: {
        posts: {
          data: []
        }
      }
    });
  } else if (prop.categoryId && prop.forumId) {
    res.json({
      CommunityStore: {
        type: 'forum',
        "club": {
          "id": 1,
          "order": 0,
          "title": "공지사항",
          "created_at": "2016-04-27T08:02:49.000Z",
          "ClubGroup": {
            "using": true,
            "id": 1,
            "created_at": "2016-04-27T08:02:49.000Z",
            "title": "공지",
            "order": 0,
            "user_id": 1,
            "description": "공지게시판 입니다",
            "updated_at": "2016-04-27T08:02:49.000Z"
          },
          "club_group_id": 1,
          "description": "공지게시판 입니다",
          "user_id": 1,
          "updated_at": "2016-04-27T08:02:49.000Z",
          "url": "notice"
        },
        "list": {
          "page": 1,
          "data": [
            {
              "id": 325,
              "comment_count": 50,
              "Prefix": null,
              "prefix_id": null,
              "User": {
                "nick": "고블린클럽"
              },
              "club_id": 1,
              "created_at": "3분 전",
              "Club": {
                "title": "공지사항",
                "url": "notice"
              },
              "user_id": 1,
              "has_img": false,
              "title": "The title 19",
              "view_count": 0,
              "deleted": false,
              "like_count": 0,
              "updated_at": "3분 전",
              "has_video": false,
              "content": "content19"
            },
            {
              "id": 308,
              "comment_count": 50,
              "Prefix": null,
              "prefix_id": null,
              "User": {
                "nick": "고블린클럽"
              },
              "club_id": 1,
              "created_at": "3분 전",
              "Club": {
                "title": "공지사항",
                "url": "notice"
              },
              "user_id": 1,
              "has_img": false,
              "title": "The title 18",
              "view_count": 0,
              "deleted": false,
              "like_count": 0,
              "updated_at": "3분 전",
              "has_video": false,
              "content": "content18"
            },
            {
              "id": 291,
              "comment_count": 50,
              "Prefix": null,
              "prefix_id": null,
              "User": {
                "nick": "고블린클럽"
              },
              "club_id": 1,
              "created_at": "3분 전",
              "Club": {
                "title": "공지사항",
                "url": "notice"
              },
              "user_id": 1,
              "has_img": false,
              "title": "The title 17",
              "view_count": 0,
              "deleted": false,
              "like_count": 0,
              "updated_at": "3분 전",
              "has_video": false,
              "content": "content17"
            },
            {
              "id": 274,
              "comment_count": 50,
              "Prefix": null,
              "prefix_id": null,
              "User": {
                "nick": "고블린클럽"
              },
              "club_id": 1,
              "created_at": "3분 전",
              "Club": {
                "title": "공지사항",
                "url": "notice"
              },
              "user_id": 1,
              "has_img": false,
              "title": "The title 16",
              "view_count": 0,
              "deleted": false,
              "like_count": 0,
              "updated_at": "3분 전",
              "has_video": false,
              "content": "content16"
            },
            {
              "id": 257,
              "comment_count": 50,
              "Prefix": null,
              "prefix_id": null,
              "User": {
                "nick": "고블린클럽"
              },
              "club_id": 1,
              "created_at": "3분 전",
              "Club": {
                "title": "공지사항",
                "url": "notice"
              },
              "user_id": 1,
              "has_img": false,
              "title": "The title 15",
              "view_count": 0,
              "deleted": false,
              "like_count": 0,
              "updated_at": "3분 전",
              "has_video": false,
              "content": "content15"
            },
            {
              "id": 240,
              "comment_count": 50,
              "Prefix": null,
              "prefix_id": null,
              "User": {
                "nick": "고블린클럽"
              },
              "club_id": 1,
              "created_at": "3분 전",
              "Club": {
                "title": "공지사항",
                "url": "notice"
              },
              "user_id": 1,
              "has_img": false,
              "title": "The title 14",
              "view_count": 0,
              "deleted": false,
              "like_count": 0,
              "updated_at": "3분 전",
              "has_video": false,
              "content": "content14"
            },
            {
              "id": 223,
              "comment_count": 50,
              "Prefix": null,
              "prefix_id": null,
              "User": {
                "nick": "고블린클럽"
              },
              "club_id": 1,
              "created_at": "3분 전",
              "Club": {
                "title": "공지사항",
                "url": "notice"
              },
              "user_id": 1,
              "has_img": false,
              "title": "The title 13",
              "view_count": 0,
              "deleted": false,
              "like_count": 0,
              "updated_at": "3분 전",
              "has_video": false,
              "content": "content13"
            },
            {
              "id": 206,
              "comment_count": 50,
              "Prefix": null,
              "prefix_id": null,
              "User": {
                "nick": "고블린클럽"
              },
              "club_id": 1,
              "created_at": "3분 전",
              "Club": {
                "title": "공지사항",
                "url": "notice"
              },
              "user_id": 1,
              "has_img": false,
              "title": "The title 12",
              "view_count": 0,
              "deleted": false,
              "like_count": 0,
              "updated_at": "3분 전",
              "has_video": false,
              "content": "content12"
            },
            {
              "id": 189,
              "comment_count": 50,
              "Prefix": null,
              "prefix_id": null,
              "User": {
                "nick": "고블린클럽"
              },
              "club_id": 1,
              "created_at": "3분 전",
              "Club": {
                "title": "공지사항",
                "url": "notice"
              },
              "user_id": 1,
              "has_img": false,
              "title": "The title 11",
              "view_count": 0,
              "deleted": false,
              "like_count": 0,
              "updated_at": "3분 전",
              "has_video": false,
              "content": "content11"
            },
            {
              "id": 172,
              "comment_count": 50,
              "Prefix": null,
              "prefix_id": null,
              "User": {
                "nick": "고블린클럽"
              },
              "club_id": 1,
              "created_at": "3분 전",
              "Club": {
                "title": "공지사항",
                "url": "notice"
              },
              "user_id": 1,
              "has_img": false,
              "title": "The title 10",
              "view_count": 0,
              "deleted": false,
              "like_count": 0,
              "updated_at": "3분 전",
              "has_video": false,
              "content": "content10"
            }
          ],
          "total": 21,
          "limit": 10
        }
      },
      GnbStore: {
        openGnb: false,
        gnbMenu: {
          openSideNow: null,
          data: [
            {
              "id": 1,
              "title": "바디/헤어",
              "order": 0,
              "description": "바디/헤어",
              "using": true,
              "category_groups": [
                {
                  "using": "1",
                  "categories": [
                    {
                      "forums": [
                        {
                          "using": "1",
                          "id": 1,
                          "order": "0",
                          "title": "샴푸/린스",
                          "category_id": 1,
                          "prefixes": [
                            {
                              "id": 1,
                              "name": "기능성 샴푸",
                              "forum_id": 1
                            },
                            {
                              "id": 2,
                              "name": "한방 샴푸",
                              "forum_id": 1
                            }
                          ],
                          "description": "샴푸/린스"
                        },
                        {
                          "using": "1",
                          "id": 2,
                          "order": "1",
                          "title": "트리트먼트/에센스",
                          "category_id": 1,
                          "prefixes": [],
                          "description": "트리트먼스/에센스"
                        },
                        {
                          "using": "1",
                          "id": 3,
                          "order": "2",
                          "title": "탈모",
                          "category_id": 1,
                          "prefixes": [],
                          "description": "탈모"
                        }
                      ],
                      "using": "1",
                      "id": 1,
                      "order": "0",
                      "title": "헤어케어",
                      "club_category_group_id": 1,
                      "description": "헤어케어"
                    },
                    {
                      "forums": [
                        {
                          "using": "1",
                          "id": 4,
                          "order": "0",
                          "title": "스타일링",
                          "category_id": 2,
                          "prefixes": [],
                          "description": "스타일링"
                        },
                        {
                          "using": "1",
                          "id": 5,
                          "order": "1",
                          "title": "염색",
                          "category_id": 2,
                          "prefixes": [],
                          "description": "염색"
                        },
                        {
                          "using": "1",
                          "id": 6,
                          "order": "2",
                          "title": "파마",
                          "category_id": 2,
                          "prefixes": [],
                          "description": "파마"
                        }
                      ],
                      "using": "1",
                      "id": 2,
                      "order": "1",
                      "title": "헤어스타일링",
                      "club_category_group_id": 1,
                      "description": "헤어스타일링"
                    }
                  ],
                  "id": 1,
                  "title": "헤어",
                  "order": "0",
                  "club_id": 1,
                  "description": "헤어"
                },
                {
                  "using": "1",
                  "categories": [
                    {
                      "forums": [
                        {
                          "using": "1",
                          "id": 7,
                          "order": "0",
                          "title": "바디워시",
                          "category_id": 3,
                          "prefixes": [],
                          "description": "바디워시"
                        },
                        {
                          "using": "1",
                          "id": 8,
                          "order": "1",
                          "title": "청결제",
                          "category_id": 3,
                          "prefixes": [],
                          "description": "청결제"
                        },
                        {
                          "using": "1",
                          "id": 9,
                          "order": "2",
                          "title": "입욕제",
                          "category_id": 3,
                          "prefixes": [],
                          "description": "입욕제"
                        },
                        {
                          "using": "1",
                          "id": 10,
                          "order": "3",
                          "title": "제모용품",
                          "category_id": 3,
                          "prefixes": [],
                          "description": "제모용품"
                        },
                        {
                          "using": "1",
                          "id": 11,
                          "order": "4",
                          "title": "데오드란트",
                          "category_id": 3,
                          "prefixes": [],
                          "description": "데오드란트"
                        },
                        {
                          "using": "1",
                          "id": 12,
                          "order": "5",
                          "title": "태닝용품",
                          "category_id": 3,
                          "prefixes": [],
                          "description": "태닝용품"
                        }
                      ],
                      "using": "1",
                      "id": 3,
                      "order": "0",
                      "title": "바디케어",
                      "club_category_group_id": 2,
                      "description": "바디케어"
                    },
                    {
                      "forums": [
                        {
                          "using": "1",
                          "id": 13,
                          "order": "0",
                          "title": "바디로션",
                          "category_id": 4,
                          "prefixes": [],
                          "description": "바디로션"
                        },
                        {
                          "using": "1",
                          "id": 14,
                          "order": "1",
                          "title": "핸드풋케어",
                          "category_id": 4,
                          "prefixes": [],
                          "description": "핸드풋케어"
                        },
                        {
                          "using": "1",
                          "id": 15,
                          "order": "2",
                          "title": "립케어",
                          "category_id": 4,
                          "prefixes": [],
                          "description": "립케어"
                        }
                      ],
                      "using": "1",
                      "id": 4,
                      "order": "1",
                      "title": "바디로션/핸드크림",
                      "club_category_group_id": 2,
                      "description": "바디로션/핸드크림"
                    },
                    {
                      "forums": [
                        {
                          "using": "1",
                          "id": 16,
                          "order": "0",
                          "title": "면도용품",
                          "category_id": 5,
                          "prefixes": [],
                          "description": "면도"
                        },
                        {
                          "using": "1",
                          "id": 17,
                          "order": "1",
                          "title": "칫솔",
                          "category_id": 5,
                          "prefixes": [],
                          "description": "칫솔"
                        },
                        {
                          "using": "1",
                          "id": 18,
                          "order": "2",
                          "title": "비누",
                          "category_id": 5,
                          "prefixes": [],
                          "description": "비누"
                        }
                      ],
                      "using": "1",
                      "id": 5,
                      "order": "2",
                      "title": "세면",
                      "club_category_group_id": 2,
                      "description": "세면"
                    }
                  ],
                  "id": 2,
                  "title": "바디",
                  "order": "1",
                  "club_id": 1,
                  "description": "바디"
                }
              ]
            },
            {
              "id": 2,
              "title": "탈모",
              "order": 0,
              "description": "바디/헤어",
              "using": true,
              "category_groups": [
                {
                  "using": "1",
                  "categories": [
                    {
                      "forums": [
                        {
                          "using": "1",
                          "id": 1,
                          "order": "0",
                          "title": "샴푸/린스",
                          "category_id": 1,
                          "prefixes": [
                            {
                              "id": 1,
                              "name": "기능성 샴푸",
                              "forum_id": 1
                            },
                            {
                              "id": 2,
                              "name": "한방 샴푸",
                              "forum_id": 1
                            }
                          ],
                          "description": "샴푸/린스"
                        },
                        {
                          "using": "1",
                          "id": 2,
                          "order": "1",
                          "title": "트리트먼트/에센스",
                          "category_id": 1,
                          "prefixes": [],
                          "description": "트리트먼스/에센스"
                        },
                        {
                          "using": "1",
                          "id": 3,
                          "order": "2",
                          "title": "탈모",
                          "category_id": 1,
                          "prefixes": [],
                          "description": "탈모"
                        }
                      ],
                      "using": "1",
                      "id": 1,
                      "order": "0",
                      "title": "탈모케어",
                      "club_category_group_id": 1,
                      "description": "헤어케어"
                    },
                    {
                      "forums": [
                        {
                          "using": "1",
                          "id": 4,
                          "order": "0",
                          "title": "스타일링",
                          "category_id": 2,
                          "prefixes": [],
                          "description": "스타일링"
                        },
                        {
                          "using": "1",
                          "id": 5,
                          "order": "1",
                          "title": "염색",
                          "category_id": 2,
                          "prefixes": [],
                          "description": "염색"
                        },
                        {
                          "using": "1",
                          "id": 6,
                          "order": "2",
                          "title": "파마",
                          "category_id": 2,
                          "prefixes": [],
                          "description": "파마"
                        }
                      ],
                      "using": "1",
                      "id": 2,
                      "order": "1",
                      "title": "헤어스타일링",
                      "club_category_group_id": 1,
                      "description": "헤어스타일링"
                    }
                  ],
                  "id": 1,
                  "title": "헤어",
                  "order": "0",
                  "club_id": 1,
                  "description": "헤어"
                },
                {
                  "using": "1",
                  "categories": [
                    {
                      "forums": [
                        {
                          "using": "1",
                          "id": 7,
                          "order": "0",
                          "title": "바디워시",
                          "category_id": 3,
                          "prefixes": [],
                          "description": "바디워시"
                        },
                        {
                          "using": "1",
                          "id": 8,
                          "order": "1",
                          "title": "청결제",
                          "category_id": 3,
                          "prefixes": [],
                          "description": "청결제"
                        },
                        {
                          "using": "1",
                          "id": 9,
                          "order": "2",
                          "title": "입욕제",
                          "category_id": 3,
                          "prefixes": [],
                          "description": "입욕제"
                        },
                        {
                          "using": "1",
                          "id": 10,
                          "order": "3",
                          "title": "제모용품",
                          "category_id": 3,
                          "prefixes": [],
                          "description": "제모용품"
                        },
                        {
                          "using": "1",
                          "id": 11,
                          "order": "4",
                          "title": "데오드란트",
                          "category_id": 3,
                          "prefixes": [],
                          "description": "데오드란트"
                        },
                        {
                          "using": "1",
                          "id": 12,
                          "order": "5",
                          "title": "태닝용품",
                          "category_id": 3,
                          "prefixes": [],
                          "description": "태닝용품"
                        }
                      ],
                      "using": "1",
                      "id": 3,
                      "order": "0",
                      "title": "바디케어",
                      "club_category_group_id": 2,
                      "description": "바디케어"
                    },
                    {
                      "forums": [
                        {
                          "using": "1",
                          "id": 13,
                          "order": "0",
                          "title": "바디로션",
                          "category_id": 4,
                          "prefixes": [],
                          "description": "바디로션"
                        },
                        {
                          "using": "1",
                          "id": 14,
                          "order": "1",
                          "title": "핸드풋케어",
                          "category_id": 4,
                          "prefixes": [],
                          "description": "핸드풋케어"
                        },
                        {
                          "using": "1",
                          "id": 15,
                          "order": "2",
                          "title": "립케어",
                          "category_id": 4,
                          "prefixes": [],
                          "description": "립케어"
                        }
                      ],
                      "using": "1",
                      "id": 4,
                      "order": "1",
                      "title": "바디로션/핸드크림",
                      "club_category_group_id": 2,
                      "description": "바디로션/핸드크림"
                    },
                    {
                      "forums": [
                        {
                          "using": "1",
                          "id": 16,
                          "order": "0",
                          "title": "면도용품",
                          "category_id": 5,
                          "prefixes": [],
                          "description": "면도"
                        },
                        {
                          "using": "1",
                          "id": 17,
                          "order": "1",
                          "title": "칫솔",
                          "category_id": 5,
                          "prefixes": [],
                          "description": "칫솔"
                        },
                        {
                          "using": "1",
                          "id": 18,
                          "order": "2",
                          "title": "비누",
                          "category_id": 5,
                          "prefixes": [],
                          "description": "비누"
                        }
                      ],
                      "using": "1",
                      "id": 5,
                      "order": "2",
                      "title": "세면",
                      "club_category_group_id": 2,
                      "description": "세면"
                    }
                  ],
                  "id": 2,
                  "title": "바디",
                  "order": "1",
                  "club_id": 1,
                  "description": "바디"
                }
              ]
            }
          ]
        },
        categoryMenu: {
          categories: [{
            "id": 3,
            "title": "바디/헤어",
            "order": 0,
            "description": "바디/헤어",
            "using": true,
            "category_groups": [
              {
                "using": "1",
                "categories": [
                  {
                    "forums": [
                      {
                        "id": 37,
                        "title": "샴푸/린스",
                        "order": "0",
                        "description": "샴푸/린스",
                        "using": "1",
                        "category_id": 11
                      },
                      {
                        "id": 38,
                        "title": "트리트먼트/에센스",
                        "order": "1",
                        "description": "트리트먼스/에센스",
                        "using": "1",
                        "category_id": 11
                      },
                      {
                        "id": 39,
                        "title": "탈모",
                        "order": "2",
                        "description": "탈모",
                        "using": "1",
                        "category_id": 11
                      }
                    ],
                    "using": "1",
                    "id": 11,
                    "order": "0",
                    "title": "헤어케어",
                    "club_category_group_id": 5,
                    "description": "헤어케어"
                  },
                  {
                    "forums": [
                      {
                        "id": 40,
                        "title": "스타일링",
                        "order": "0",
                        "description": "스타일링",
                        "using": "1",
                        "category_id": 12
                      },
                      {
                        "id": 41,
                        "title": "염색",
                        "order": "1",
                        "description": "염색",
                        "using": "1",
                        "category_id": 12
                      },
                      {
                        "id": 42,
                        "title": "파마",
                        "order": "2",
                        "description": "파마",
                        "using": "1",
                        "category_id": 12
                      }
                    ],
                    "using": "1",
                    "id": 12,
                    "order": "1",
                    "title": "헤어스타일링",
                    "club_category_group_id": 5,
                    "description": "헤어스타일링"
                  }
                ],
                "id": 5,
                "title": "헤어",
                "order": "0",
                "club_id": 3,
                "description": "헤어"
              },
              {
                "using": "1",
                "categories": [
                  {
                    "forums": [
                      {
                        "id": 43,
                        "title": "바디워시",
                        "order": "0",
                        "description": "바디워시",
                        "using": "1",
                        "category_id": 13
                      },
                      {
                        "id": 44,
                        "title": "청결제",
                        "order": "1",
                        "description": "청결제",
                        "using": "1",
                        "category_id": 13
                      },
                      {
                        "id": 45,
                        "title": "입욕제",
                        "order": "2",
                        "description": "입욕제",
                        "using": "1",
                        "category_id": 13
                      },
                      {
                        "id": 46,
                        "title": "제모용품",
                        "order": "3",
                        "description": "제모용품",
                        "using": "1",
                        "category_id": 13
                      },
                      {
                        "id": 47,
                        "title": "데오드란트",
                        "order": "4",
                        "description": "데오드란트",
                        "using": "1",
                        "category_id": 13
                      },
                      {
                        "id": 48,
                        "title": "태닝용품",
                        "order": "5",
                        "description": "태닝용품",
                        "using": "1",
                        "category_id": 13
                      }
                    ],
                    "using": "1",
                    "id": 13,
                    "order": "0",
                    "title": "바디케어",
                    "club_category_group_id": 6,
                    "description": "바디케어"
                  },
                  {
                    "forums": [
                      {
                        "id": 49,
                        "title": "바디로션",
                        "order": "0",
                        "description": "바디로션",
                        "using": "1",
                        "category_id": 14
                      },
                      {
                        "id": 50,
                        "title": "핸드풋케어",
                        "order": "1",
                        "description": "핸드풋케어",
                        "using": "1",
                        "category_id": 14
                      },
                      {
                        "id": 51,
                        "title": "립케어",
                        "order": "2",
                        "description": "립케어",
                        "using": "1",
                        "category_id": 14
                      }
                    ],
                    "using": "1",
                    "id": 14,
                    "order": "1",
                    "title": "바디로션/핸드크림",
                    "club_category_group_id": 6,
                    "description": "바디로션/핸드크림"
                  },
                  {
                    "forums": [
                      {
                        "id": 52,
                        "title": "면도용품",
                        "order": "0",
                        "description": "면도",
                        "using": "1",
                        "category_id": 15
                      },
                      {
                        "id": 53,
                        "title": "칫솔",
                        "order": "1",
                        "description": "칫솔",
                        "using": "1",
                        "category_id": 15
                      },
                      {
                        "id": 54,
                        "title": "비누",
                        "order": "2",
                        "description": "비누",
                        "using": "1",
                        "category_id": 15
                      }
                    ],
                    "using": "1",
                    "id": 15,
                    "order": "2",
                    "title": "세면",
                    "club_category_group_id": 6,
                    "description": "세면"
                  }
                ],
                "id": 6,
                "title": "바디",
                "order": "1",
                "club_id": 3,
                "description": "바디"
              }
            ]
          }]
        }
      },
      LoginStore: res.resultData.LoginStore,
      UserStore: {
        user: res.resultData.UserStore.user,
        trendbox: res.resultData.UserStore.trendbox,
        profile: res.resultData.UserStore.profile,
        icon: {
          id: 1,
          img: 'icon_1.png'
        },
        grade: {
          name: '브론즈',
          img: 'grade_bronze.png'
        }
      },
      SigninStore: {
        emailDup: null,
        nickDup: null,
        emailRequested: null,
        submitResult: false,
        emailVerifySuccess: false,
        emailVerifyFail: false
      },
      BestPostStore: {
        posts: {
          data: []
        }
      }
    });
  } else if (prop.categoryId) {
    res.json({
      CommunityStore: {
        type: 'category'
      },
      GnbStore: {
        openGnb: false,
        gnbMenu: {
          openSideNow: null,
          data: [
            {
              "id": 1,
              "title": "바디/헤어",
              "order": 0,
              "description": "바디/헤어",
              "using": true,
              "category_groups": [
                {
                  "using": "1",
                  "categories": [
                    {
                      "using": "1",
                      "id": 1,
                      "order": "0",
                      "title": "헤어케어",
                      "club_category_group_id": 1,
                      "description": "헤어케어"
                    },
                    {
                      "using": "1",
                      "id": 2,
                      "order": "1",
                      "title": "헤어스타일링",
                      "club_category_group_id": 1,
                      "description": "헤어스타일링"
                    }
                  ],
                  "id": 1,
                  "title": "헤어",
                  "order": "0",
                  "club_id": 1,
                  "description": "헤어"
                },
                {
                  "using": "1",
                  "categories": [
                    {
                      "using": "1",
                      "id": 3,
                      "order": "0",
                      "title": "바디케어",
                      "club_category_group_id": 2,
                      "description": "바디케어"
                    },
                    {
                      "using": "1",
                      "id": 4,
                      "order": "1",
                      "title": "바디로션/핸드크림",
                      "club_category_group_id": 2,
                      "description": "바디로션/핸드크림"
                    },
                    {
                      "using": "1",
                      "id": 5,
                      "order": "2",
                      "title": "세면",
                      "club_category_group_id": 2,
                      "description": "세면"
                    }
                  ],
                  "id": 2,
                  "title": "바디",
                  "order": "1",
                  "club_id": 1,
                  "description": "바디"
                }
              ]
            },
            {
              "id": 2,
              "title": "탈모",
              "order": 0,
              "description": "바디/헤어",
              "using": true,
              "category_groups": [
                {
                  "using": "1",
                  "categories": [
                    {
                      "using": "1",
                      "id": 1,
                      "order": "0",
                      "title": "탈모케어",
                      "club_category_group_id": 1,
                      "description": "헤어케어"
                    },
                    {
                      "using": "1",
                      "id": 2,
                      "order": "1",
                      "title": "헤어스타일링",
                      "club_category_group_id": 1,
                      "description": "헤어스타일링"
                    }
                  ],
                  "id": 1,
                  "title": "헤어",
                  "order": "0",
                  "club_id": 1,
                  "description": "헤어"
                },
                {
                  "using": "1",
                  "categories": [
                    {
                      "using": "1",
                      "id": 3,
                      "order": "0",
                      "title": "바디케어",
                      "club_category_group_id": 2,
                      "description": "바디케어"
                    },
                    {
                      "forums": [
                        {
                          "using": "1",
                          "id": 13,
                          "order": "0",
                          "title": "바디로션",
                          "category_id": 4,
                          "prefixes": [],
                          "description": "바디로션"
                        },
                        {
                          "using": "1",
                          "id": 14,
                          "order": "1",
                          "title": "핸드풋케어",
                          "category_id": 4,
                          "prefixes": [],
                          "description": "핸드풋케어"
                        },
                        {
                          "using": "1",
                          "id": 15,
                          "order": "2",
                          "title": "립케어",
                          "category_id": 4,
                          "prefixes": [],
                          "description": "립케어"
                        }
                      ],
                      "using": "1",
                      "id": 4,
                      "order": "1",
                      "title": "바디로션/핸드크림",
                      "club_category_group_id": 2,
                      "description": "바디로션/핸드크림"
                    },
                    {
                      "forums": [
                        {
                          "using": "1",
                          "id": 16,
                          "order": "0",
                          "title": "면도용품",
                          "category_id": 5,
                          "prefixes": [],
                          "description": "면도"
                        },
                        {
                          "using": "1",
                          "id": 17,
                          "order": "1",
                          "title": "칫솔",
                          "category_id": 5,
                          "prefixes": [],
                          "description": "칫솔"
                        },
                        {
                          "using": "1",
                          "id": 18,
                          "order": "2",
                          "title": "비누",
                          "category_id": 5,
                          "prefixes": [],
                          "description": "비누"
                        }
                      ],
                      "using": "1",
                      "id": 5,
                      "order": "2",
                      "title": "세면",
                      "club_category_group_id": 2,
                      "description": "세면"
                    }
                  ],
                  "id": 2,
                  "title": "바디",
                  "order": "1",
                  "club_id": 1,
                  "description": "바디"
                }
              ]
            }
          ]
        },
        categoryMenu: {
          categories: [{
            "id": 3,
            "title": "바디/헤어",
            "order": 0,
            "description": "바디/헤어",
            "using": true,
            "category_groups": [
              {
                "using": "1",
                "categories": [
                  {
                    "forums": [
                      {
                        "id": 37,
                        "title": "샴푸/린스",
                        "order": "0",
                        "description": "샴푸/린스",
                        "using": "1",
                        "category_id": 11
                      },
                      {
                        "id": 38,
                        "title": "트리트먼트/에센스",
                        "order": "1",
                        "description": "트리트먼스/에센스",
                        "using": "1",
                        "category_id": 11
                      },
                      {
                        "id": 39,
                        "title": "탈모",
                        "order": "2",
                        "description": "탈모",
                        "using": "1",
                        "category_id": 11
                      }
                    ],
                    "using": "1",
                    "id": 11,
                    "order": "0",
                    "title": "헤어케어",
                    "club_category_group_id": 5,
                    "description": "헤어케어"
                  },
                  {
                    "forums": [
                      {
                        "id": 40,
                        "title": "스타일링",
                        "order": "0",
                        "description": "스타일링",
                        "using": "1",
                        "category_id": 12
                      },
                      {
                        "id": 41,
                        "title": "염색",
                        "order": "1",
                        "description": "염색",
                        "using": "1",
                        "category_id": 12
                      },
                      {
                        "id": 42,
                        "title": "파마",
                        "order": "2",
                        "description": "파마",
                        "using": "1",
                        "category_id": 12
                      }
                    ],
                    "using": "1",
                    "id": 12,
                    "order": "1",
                    "title": "헤어스타일링",
                    "club_category_group_id": 5,
                    "description": "헤어스타일링"
                  }
                ],
                "id": 5,
                "title": "헤어",
                "order": "0",
                "club_id": 3,
                "description": "헤어"
              },
              {
                "using": "1",
                "categories": [
                  {
                    "forums": [
                      {
                        "id": 43,
                        "title": "바디워시",
                        "order": "0",
                        "description": "바디워시",
                        "using": "1",
                        "category_id": 13
                      },
                      {
                        "id": 44,
                        "title": "청결제",
                        "order": "1",
                        "description": "청결제",
                        "using": "1",
                        "category_id": 13
                      },
                      {
                        "id": 45,
                        "title": "입욕제",
                        "order": "2",
                        "description": "입욕제",
                        "using": "1",
                        "category_id": 13
                      },
                      {
                        "id": 46,
                        "title": "제모용품",
                        "order": "3",
                        "description": "제모용품",
                        "using": "1",
                        "category_id": 13
                      },
                      {
                        "id": 47,
                        "title": "데오드란트",
                        "order": "4",
                        "description": "데오드란트",
                        "using": "1",
                        "category_id": 13
                      },
                      {
                        "id": 48,
                        "title": "태닝용품",
                        "order": "5",
                        "description": "태닝용품",
                        "using": "1",
                        "category_id": 13
                      }
                    ],
                    "using": "1",
                    "id": 13,
                    "order": "0",
                    "title": "바디케어",
                    "club_category_group_id": 6,
                    "description": "바디케어"
                  },
                  {
                    "forums": [
                      {
                        "id": 49,
                        "title": "바디로션",
                        "order": "0",
                        "description": "바디로션",
                        "using": "1",
                        "category_id": 14
                      },
                      {
                        "id": 50,
                        "title": "핸드풋케어",
                        "order": "1",
                        "description": "핸드풋케어",
                        "using": "1",
                        "category_id": 14
                      },
                      {
                        "id": 51,
                        "title": "립케어",
                        "order": "2",
                        "description": "립케어",
                        "using": "1",
                        "category_id": 14
                      }
                    ],
                    "using": "1",
                    "id": 14,
                    "order": "1",
                    "title": "바디로션/핸드크림",
                    "club_category_group_id": 6,
                    "description": "바디로션/핸드크림"
                  },
                  {
                    "forums": [
                      {
                        "id": 52,
                        "title": "면도용품",
                        "order": "0",
                        "description": "면도",
                        "using": "1",
                        "category_id": 15
                      },
                      {
                        "id": 53,
                        "title": "칫솔",
                        "order": "1",
                        "description": "칫솔",
                        "using": "1",
                        "category_id": 15
                      },
                      {
                        "id": 54,
                        "title": "비누",
                        "order": "2",
                        "description": "비누",
                        "using": "1",
                        "category_id": 15
                      }
                    ],
                    "using": "1",
                    "id": 15,
                    "order": "2",
                    "title": "세면",
                    "club_category_group_id": 6,
                    "description": "세면"
                  }
                ],
                "id": 6,
                "title": "바디",
                "order": "1",
                "club_id": 3,
                "description": "바디"
              }
            ]
          }]
        }
      },
      LoginStore: res.resultData.LoginStore,
      UserStore: {
        user: res.resultData.UserStore.user,
        trendbox: res.resultData.UserStore.trendbox,
        profile: res.resultData.UserStore.profile,
        icon: {
          id: 1,
          img: 'icon_1.png'
        },
        grade: {
          name: '브론즈',
          img: 'grade_bronze.png'
        }
      },
      SigninStore: {
        emailDup: null,
        nickDup: null,
        emailRequested: null,
        submitResult: false,
        emailVerifySuccess: false,
        emailVerifyFail: false
      },
      BestPostStore: {
        posts: {
          data: []
        }
      }
    })
  } else {
    res.json({
      GnbStore: {
        openGnb: false,
        gnbMenu: {
          openSideNow: null,
          data: [
            {
              "id": 1,
              "title": "바디/헤어",
              "order": 0,
              "description": "바디/헤어",
              "using": true,
              "category_groups": [
                {
                  "using": "1",
                  "categories": [
                    {
                      "forums": [
                        {
                          "using": "1",
                          "id": 1,
                          "order": "0",
                          "title": "샴푸/린스",
                          "category_id": 1,
                          "prefixes": [
                            {
                              "id": 1,
                              "name": "기능성 샴푸",
                              "forum_id": 1
                            },
                            {
                              "id": 2,
                              "name": "한방 샴푸",
                              "forum_id": 1
                            }
                          ],
                          "description": "샴푸/린스"
                        },
                        {
                          "using": "1",
                          "id": 2,
                          "order": "1",
                          "title": "트리트먼트/에센스",
                          "category_id": 1,
                          "prefixes": [
                          ],
                          "description": "트리트먼스/에센스"
                        },
                        {
                          "using": "1",
                          "id": 3,
                          "order": "2",
                          "title": "탈모",
                          "category_id": 1,
                          "prefixes": [
                          ],
                          "description": "탈모"
                        }
                      ],
                      "using": "1",
                      "id": 1,
                      "order": "0",
                      "title": "헤어케어",
                      "club_category_group_id": 1,
                      "description": "헤어케어"
                    },
                    {
                      "forums": [
                        {
                          "using": "1",
                          "id": 4,
                          "order": "0",
                          "title": "스타일링",
                          "category_id": 2,
                          "prefixes": [
                          ],
                          "description": "스타일링"
                        },
                        {
                          "using": "1",
                          "id": 5,
                          "order": "1",
                          "title": "염색",
                          "category_id": 2,
                          "prefixes": [
                          ],
                          "description": "염색"
                        },
                        {
                          "using": "1",
                          "id": 6,
                          "order": "2",
                          "title": "파마",
                          "category_id": 2,
                          "prefixes": [
                          ],
                          "description": "파마"
                        }
                      ],
                      "using": "1",
                      "id": 2,
                      "order": "1",
                      "title": "헤어스타일링",
                      "club_category_group_id": 1,
                      "description": "헤어스타일링"
                    }
                  ],
                  "id": 1,
                  "title": "헤어",
                  "order": "0",
                  "club_id": 1,
                  "description": "헤어"
                },
                {
                  "using": "1",
                  "categories": [
                    {
                      "forums": [
                        {
                          "using": "1",
                          "id": 7,
                          "order": "0",
                          "title": "바디워시",
                          "category_id": 3,
                          "prefixes": [
                          ],
                          "description": "바디워시"
                        },
                        {
                          "using": "1",
                          "id": 8,
                          "order": "1",
                          "title": "청결제",
                          "category_id": 3,
                          "prefixes": [
                          ],
                          "description": "청결제"
                        },
                        {
                          "using": "1",
                          "id": 9,
                          "order": "2",
                          "title": "입욕제",
                          "category_id": 3,
                          "prefixes": [
                          ],
                          "description": "입욕제"
                        },
                        {
                          "using": "1",
                          "id": 10,
                          "order": "3",
                          "title": "제모용품",
                          "category_id": 3,
                          "prefixes": [
                          ],
                          "description": "제모용품"
                        },
                        {
                          "using": "1",
                          "id": 11,
                          "order": "4",
                          "title": "데오드란트",
                          "category_id": 3,
                          "prefixes": [
                          ],
                          "description": "데오드란트"
                        },
                        {
                          "using": "1",
                          "id": 12,
                          "order": "5",
                          "title": "태닝용품",
                          "category_id": 3,
                          "prefixes": [
                          ],
                          "description": "태닝용품"
                        }
                      ],
                      "using": "1",
                      "id": 3,
                      "order": "0",
                      "title": "바디케어",
                      "club_category_group_id": 2,
                      "description": "바디케어"
                    },
                    {
                      "forums": [
                        {
                          "using": "1",
                          "id": 13,
                          "order": "0",
                          "title": "바디로션",
                          "category_id": 4,
                          "prefixes": [
                          ],
                          "description": "바디로션"
                        },
                        {
                          "using": "1",
                          "id": 14,
                          "order": "1",
                          "title": "핸드풋케어",
                          "category_id": 4,
                          "prefixes": [
                          ],
                          "description": "핸드풋케어"
                        },
                        {
                          "using": "1",
                          "id": 15,
                          "order": "2",
                          "title": "립케어",
                          "category_id": 4,
                          "prefixes": [
                          ],
                          "description": "립케어"
                        }
                      ],
                      "using": "1",
                      "id": 4,
                      "order": "1",
                      "title": "바디로션/핸드크림",
                      "club_category_group_id": 2,
                      "description": "바디로션/핸드크림"
                    },
                    {
                      "forums": [
                        {
                          "using": "1",
                          "id": 16,
                          "order": "0",
                          "title": "면도용품",
                          "category_id": 5,
                          "prefixes": [
                          ],
                          "description": "면도"
                        },
                        {
                          "using": "1",
                          "id": 17,
                          "order": "1",
                          "title": "칫솔",
                          "category_id": 5,
                          "prefixes": [
                          ],
                          "description": "칫솔"
                        },
                        {
                          "using": "1",
                          "id": 18,
                          "order": "2",
                          "title": "비누",
                          "category_id": 5,
                          "prefixes": [
                          ],
                          "description": "비누"
                        }
                      ],
                      "using": "1",
                      "id": 5,
                      "order": "2",
                      "title": "세면",
                      "club_category_group_id": 2,
                      "description": "세면"
                    }
                  ],
                  "id": 2,
                  "title": "바디",
                  "order": "1",
                  "club_id": 1,
                  "description": "바디"
                }
              ]
            },
            {
              "id": 2,
              "title": "탈모",
              "order": 0,
              "description": "바디/헤어",
              "using": true,
              "category_groups": [
                {
                  "using": "1",
                  "categories": [
                    {
                      "forums": [
                        {
                          "using": "1",
                          "id": 1,
                          "order": "0",
                          "title": "샴푸/린스",
                          "category_id": 1,
                          "prefixes": [
                            {
                              "id": 1,
                              "name": "기능성 샴푸",
                              "forum_id": 1
                            },
                            {
                              "id": 2,
                              "name": "한방 샴푸",
                              "forum_id": 1
                            }
                          ],
                          "description": "샴푸/린스"
                        },
                        {
                          "using": "1",
                          "id": 2,
                          "order": "1",
                          "title": "트리트먼트/에센스",
                          "category_id": 1,
                          "prefixes": [
                          ],
                          "description": "트리트먼스/에센스"
                        },
                        {
                          "using": "1",
                          "id": 3,
                          "order": "2",
                          "title": "탈모",
                          "category_id": 1,
                          "prefixes": [
                          ],
                          "description": "탈모"
                        }
                      ],
                      "using": "1",
                      "id": 1,
                      "order": "0",
                      "title": "탈모케어",
                      "club_category_group_id": 1,
                      "description": "헤어케어"
                    },
                    {
                      "forums": [
                        {
                          "using": "1",
                          "id": 4,
                          "order": "0",
                          "title": "스타일링",
                          "category_id": 2,
                          "prefixes": [
                          ],
                          "description": "스타일링"
                        },
                        {
                          "using": "1",
                          "id": 5,
                          "order": "1",
                          "title": "염색",
                          "category_id": 2,
                          "prefixes": [
                          ],
                          "description": "염색"
                        },
                        {
                          "using": "1",
                          "id": 6,
                          "order": "2",
                          "title": "파마",
                          "category_id": 2,
                          "prefixes": [
                          ],
                          "description": "파마"
                        }
                      ],
                      "using": "1",
                      "id": 2,
                      "order": "1",
                      "title": "헤어스타일링",
                      "club_category_group_id": 1,
                      "description": "헤어스타일링"
                    }
                  ],
                  "id": 1,
                  "title": "헤어",
                  "order": "0",
                  "club_id": 1,
                  "description": "헤어"
                },
                {
                  "using": "1",
                  "categories": [
                    {
                      "forums": [
                        {
                          "using": "1",
                          "id": 7,
                          "order": "0",
                          "title": "바디워시",
                          "category_id": 3,
                          "prefixes": [
                          ],
                          "description": "바디워시"
                        },
                        {
                          "using": "1",
                          "id": 8,
                          "order": "1",
                          "title": "청결제",
                          "category_id": 3,
                          "prefixes": [
                          ],
                          "description": "청결제"
                        },
                        {
                          "using": "1",
                          "id": 9,
                          "order": "2",
                          "title": "입욕제",
                          "category_id": 3,
                          "prefixes": [
                          ],
                          "description": "입욕제"
                        },
                        {
                          "using": "1",
                          "id": 10,
                          "order": "3",
                          "title": "제모용품",
                          "category_id": 3,
                          "prefixes": [
                          ],
                          "description": "제모용품"
                        },
                        {
                          "using": "1",
                          "id": 11,
                          "order": "4",
                          "title": "데오드란트",
                          "category_id": 3,
                          "prefixes": [
                          ],
                          "description": "데오드란트"
                        },
                        {
                          "using": "1",
                          "id": 12,
                          "order": "5",
                          "title": "태닝용품",
                          "category_id": 3,
                          "prefixes": [
                          ],
                          "description": "태닝용품"
                        }
                      ],
                      "using": "1",
                      "id": 3,
                      "order": "0",
                      "title": "바디케어",
                      "club_category_group_id": 2,
                      "description": "바디케어"
                    },
                    {
                      "forums": [
                        {
                          "using": "1",
                          "id": 13,
                          "order": "0",
                          "title": "바디로션",
                          "category_id": 4,
                          "prefixes": [
                          ],
                          "description": "바디로션"
                        },
                        {
                          "using": "1",
                          "id": 14,
                          "order": "1",
                          "title": "핸드풋케어",
                          "category_id": 4,
                          "prefixes": [
                          ],
                          "description": "핸드풋케어"
                        },
                        {
                          "using": "1",
                          "id": 15,
                          "order": "2",
                          "title": "립케어",
                          "category_id": 4,
                          "prefixes": [
                          ],
                          "description": "립케어"
                        }
                      ],
                      "using": "1",
                      "id": 4,
                      "order": "1",
                      "title": "바디로션/핸드크림",
                      "club_category_group_id": 2,
                      "description": "바디로션/핸드크림"
                    },
                    {
                      "forums": [
                        {
                          "using": "1",
                          "id": 16,
                          "order": "0",
                          "title": "면도용품",
                          "category_id": 5,
                          "prefixes": [
                          ],
                          "description": "면도"
                        },
                        {
                          "using": "1",
                          "id": 17,
                          "order": "1",
                          "title": "칫솔",
                          "category_id": 5,
                          "prefixes": [
                          ],
                          "description": "칫솔"
                        },
                        {
                          "using": "1",
                          "id": 18,
                          "order": "2",
                          "title": "비누",
                          "category_id": 5,
                          "prefixes": [
                          ],
                          "description": "비누"
                        }
                      ],
                      "using": "1",
                      "id": 5,
                      "order": "2",
                      "title": "세면",
                      "club_category_group_id": 2,
                      "description": "세면"
                    }
                  ],
                  "id": 2,
                  "title": "바디",
                  "order": "1",
                  "club_id": 1,
                  "description": "바디"
                }
              ]
            }
          ]
        },
        categoryMenu: {
          categories: [{
            "id": 3,
            "title": "바디/헤어",
            "order": 0,
            "description": "바디/헤어",
            "using": true,
            "category_groups": [
              {
                "using": "1",
                "categories": [
                  {
                    "forums": [
                      {
                        "id": 37,
                        "title": "샴푸/린스",
                        "order": "0",
                        "description": "샴푸/린스",
                        "using": "1",
                        "category_id": 11
                      },
                      {
                        "id": 38,
                        "title": "트리트먼트/에센스",
                        "order": "1",
                        "description": "트리트먼스/에센스",
                        "using": "1",
                        "category_id": 11
                      },
                      {
                        "id": 39,
                        "title": "탈모",
                        "order": "2",
                        "description": "탈모",
                        "using": "1",
                        "category_id": 11
                      }
                    ],
                    "using": "1",
                    "id": 11,
                    "order": "0",
                    "title": "헤어케어",
                    "club_category_group_id": 5,
                    "description": "헤어케어"
                  },
                  {
                    "forums": [
                      {
                        "id": 40,
                        "title": "스타일링",
                        "order": "0",
                        "description": "스타일링",
                        "using": "1",
                        "category_id": 12
                      },
                      {
                        "id": 41,
                        "title": "염색",
                        "order": "1",
                        "description": "염색",
                        "using": "1",
                        "category_id": 12
                      },
                      {
                        "id": 42,
                        "title": "파마",
                        "order": "2",
                        "description": "파마",
                        "using": "1",
                        "category_id": 12
                      }
                    ],
                    "using": "1",
                    "id": 12,
                    "order": "1",
                    "title": "헤어스타일링",
                    "club_category_group_id": 5,
                    "description": "헤어스타일링"
                  }
                ],
                "id": 5,
                "title": "헤어",
                "order": "0",
                "club_id": 3,
                "description": "헤어"
              },
              {
                "using": "1",
                "categories": [
                  {
                    "forums": [
                      {
                        "id": 43,
                        "title": "바디워시",
                        "order": "0",
                        "description": "바디워시",
                        "using": "1",
                        "category_id": 13
                      },
                      {
                        "id": 44,
                        "title": "청결제",
                        "order": "1",
                        "description": "청결제",
                        "using": "1",
                        "category_id": 13
                      },
                      {
                        "id": 45,
                        "title": "입욕제",
                        "order": "2",
                        "description": "입욕제",
                        "using": "1",
                        "category_id": 13
                      },
                      {
                        "id": 46,
                        "title": "제모용품",
                        "order": "3",
                        "description": "제모용품",
                        "using": "1",
                        "category_id": 13
                      },
                      {
                        "id": 47,
                        "title": "데오드란트",
                        "order": "4",
                        "description": "데오드란트",
                        "using": "1",
                        "category_id": 13
                      },
                      {
                        "id": 48,
                        "title": "태닝용품",
                        "order": "5",
                        "description": "태닝용품",
                        "using": "1",
                        "category_id": 13
                      }
                    ],
                    "using": "1",
                    "id": 13,
                    "order": "0",
                    "title": "바디케어",
                    "club_category_group_id": 6,
                    "description": "바디케어"
                  },
                  {
                    "forums": [
                      {
                        "id": 49,
                        "title": "바디로션",
                        "order": "0",
                        "description": "바디로션",
                        "using": "1",
                        "category_id": 14
                      },
                      {
                        "id": 50,
                        "title": "핸드풋케어",
                        "order": "1",
                        "description": "핸드풋케어",
                        "using": "1",
                        "category_id": 14
                      },
                      {
                        "id": 51,
                        "title": "립케어",
                        "order": "2",
                        "description": "립케어",
                        "using": "1",
                        "category_id": 14
                      }
                    ],
                    "using": "1",
                    "id": 14,
                    "order": "1",
                    "title": "바디로션/핸드크림",
                    "club_category_group_id": 6,
                    "description": "바디로션/핸드크림"
                  },
                  {
                    "forums": [
                      {
                        "id": 52,
                        "title": "면도용품",
                        "order": "0",
                        "description": "면도",
                        "using": "1",
                        "category_id": 15
                      },
                      {
                        "id": 53,
                        "title": "칫솔",
                        "order": "1",
                        "description": "칫솔",
                        "using": "1",
                        "category_id": 15
                      },
                      {
                        "id": 54,
                        "title": "비누",
                        "order": "2",
                        "description": "비누",
                        "using": "1",
                        "category_id": 15
                      }
                    ],
                    "using": "1",
                    "id": 15,
                    "order": "2",
                    "title": "세면",
                    "club_category_group_id": 6,
                    "description": "세면"
                  }
                ],
                "id": 6,
                "title": "바디",
                "order": "1",
                "club_id": 3,
                "description": "바디"
              }
            ]
          }]
        }
      },
      LoginStore: res.resultData.LoginStore,
      UserStore: {
        user: res.resultData.UserStore.user,
        trendbox: res.resultData.UserStore.trendbox,
        profile: res.resultData.UserStore.profile,
        icon: {
          id: 1,
          img: 'icon_1.png'
        },
        grade: {
          name: '브론즈',
          img: 'grade_bronze.png'
        }
      },
      BestPostStore: {
        posts: {
          data: [
            {
              id: 1,
              title: '트랜드 클리어를 소개합니다',
              content: '<p>대통령후보자가 1인일 때에는 그 득표수가 선거권자 총수의 3분의 1 이상이 아니면 대통령으로 당선될 수 없다. 모든 국민은 근로의 권리를 가진다. 국가는 사회적·경제적 방법으로 근로자의 고용의 증진과 적정임금의 보장에 노력하여야 하며, 법률이 정하는 바에 의하여 최저임금제를 시행하여야 한다.</p> <p>사면·감형 및 복권에 관한 사항은 법률로 정한다. 모든 국민은 법 앞에 평등하다. 누구든지 성별·종교 또는 사회적 신분에 의하여 정치적·경제적·사회적·문화적 생활의 모든 영역에 있어서 차별을 받지 아니한다. 대통령은 헌법과 법률이 정하는 바에 의하여 국군을 통수한다. 국회의원은 그 지위를 남용하여 국가·공공단체 또는 기업체와의 계약이나 그 처분에 의하여 재산상의 권리·이익 또는 직위를 취득하거나 타인을 위하여 그 취득을 알선할 수 없다.</p> <p>모든 국민은 법률이 정하는 바에 의하여 납세의 의무를 진다. 국가는 농수산물의 수급균형과 유통구조의 개선에 노력하여 가격안정을 도모함으로써 농·어민의 이익을 보호한다. 각급 선거관리위원회는 선거인명부의 작성등 선거사무와 국민투표사무에 관하여 관계 행정기관에 필요한 지시를 할 수 있다.</p> <p>지방자치단체는 주민의 복리에 관한 사무를 처리하고 재산을 관리하며, 법령의 범위안에서 자치에 관한 규정을 제정할 수 있다. 사회적 특수계급의 제도는 인정되지 아니하며, 어떠한 형태로도 이를 창설할 수 없다. 국가는 주택개발정책등을 통하여 모든 국민이 쾌적한 주거생활을 할 수 있도록 노력하여야 한다.</p> <p>법률안에 이의가 있을 때에는 대통령은 제1항의 기간내에 이의서를 붙여 국회로 환부하고, 그 재의를 요구할 수 있다. 국회의 폐회중에도 또한 같다. 정당의 설립은 자유이며, 복수정당제는 보장된다. 대통령은 제3항과 제4항의 사유를 지체없이 공포하여야 한다. 대통령이 궐위되거나 사고로 인하여 직무를 수행할 수 없을 때에는 국무총리, 법률이 정한 국무위원의 순서로 그 권한을 대행한다.</p> <p>행정각부의 설치·조직과 직무범위는 법률로 정한다. 국가안전보장회의의 조직·직무범위 기타 필요한 사항은 법률로 정한다. 원장은 국회의 동의를 얻어 대통령이 임명하고, 그 임기는 4년으로 하며, 1차에 한하여 중임할 수 있다. 모든 국민은 학문과 예술의 자유를 가진다. 모든 국민은 그 보호하는 자녀에게 적어도 초등교육과 법률이 정하는 교육을 받게 할 의무를 진다.</p> <p>혼인과 가족생활은 개인의 존엄과 양성의 평등을 기초로 성립되고 유지되어야 하며, 국가는 이를 보장한다. 모든 국민은 인간다운 생활을 할 권리를 가진다. 국무총리 또는 행정각부의 장은 소관사무에 관하여 법률이나 대통령령의 위임 또는 직권으로 총리령 또는 부령을 발할 수 있다. 대법원과 각급법원의 조직은 법률로 정한다.</p> <p>대통령은 법률안의 일부에 대하여 또는 법률안을 수정하여 재의를 요구할 수 없다. 사법권은 법관으로 구성된 법원에 속한다. 재산권의 행사는 공공복리에 적합하도록 하여야 한다. 신체장애자 및 질병·노령 기타의 사유로 생활능력이 없는 국민은 법률이 정하는 바에 의하여 국가의 보호를 받는다. 국무위원은 국무총리의 제청으로 대통령이 임명한다.</p>',
              author: {
                nick: 'Destiny',
                icon: {
                  img: 'icon_1.png'
                },
                sex: 1,
                avatar_img: null
              },
              categories: {
                club: {
                  title: '헤어',
                  category: {
                    title: '탈모',
                    forum: {
                      title: '탈모치료제'
                    }
                  }
                }
              },
              created_at: '2016-12-12 13:23',
              view_count: '1,232',
              like_count: '1,232',
              comment_count: '322'
            },
            {
              id: 2,
              title: '트랜드 클리어를 소개합니다2',
              content: '<p>대통령후보자가 1인일 때에는 그 득표수가 선거권자 총수의 3분의 1 이상이 아니면 대통령으로 당선될 수 없다. 모든 국민은 근로의 권리를 가진다. 국가는 사회적·경제적 방법으로 근로자의 고용의 증진과 적정임금의 보장에 노력하여야 하며, 법률이 정하는 바에 의하여 최저임금제를 시행하여야 한다.</p> <p>사면·감형 및 복권에 관한 사항은 법률로 정한다. 모든 국민은 법 앞에 평등하다. 누구든지 성별·종교 또는 사회적 신분에 의하여 정치적·경제적·사회적·문화적 생활의 모든 영역에 있어서 차별을 받지 아니한다. 대통령은 헌법과 법률이 정하는 바에 의하여 국군을 통수한다. 국회의원은 그 지위를 남용하여 국가·공공단체 또는 기업체와의 계약이나 그 처분에 의하여 재산상의 권리·이익 또는 직위를 취득하거나 타인을 위하여 그 취득을 알선할 수 없다.</p> <p>모든 국민은 법률이 정하는 바에 의하여 납세의 의무를 진다. 국가는 농수산물의 수급균형과 유통구조의 개선에 노력하여 가격안정을 도모함으로써 농·어민의 이익을 보호한다. 각급 선거관리위원회는 선거인명부의 작성등 선거사무와 국민투표사무에 관하여 관계 행정기관에 필요한 지시를 할 수 있다.</p> <p>지방자치단체는 주민의 복리에 관한 사무를 처리하고 재산을 관리하며, 법령의 범위안에서 자치에 관한 규정을 제정할 수 있다. 사회적 특수계급의 제도는 인정되지 아니하며, 어떠한 형태로도 이를 창설할 수 없다. 국가는 주택개발정책등을 통하여 모든 국민이 쾌적한 주거생활을 할 수 있도록 노력하여야 한다.</p> <p>법률안에 이의가 있을 때에는 대통령은 제1항의 기간내에 이의서를 붙여 국회로 환부하고, 그 재의를 요구할 수 있다. 국회의 폐회중에도 또한 같다. 정당의 설립은 자유이며, 복수정당제는 보장된다. 대통령은 제3항과 제4항의 사유를 지체없이 공포하여야 한다. 대통령이 궐위되거나 사고로 인하여 직무를 수행할 수 없을 때에는 국무총리, 법률이 정한 국무위원의 순서로 그 권한을 대행한다.</p> <p>행정각부의 설치·조직과 직무범위는 법률로 정한다. 국가안전보장회의의 조직·직무범위 기타 필요한 사항은 법률로 정한다. 원장은 국회의 동의를 얻어 대통령이 임명하고, 그 임기는 4년으로 하며, 1차에 한하여 중임할 수 있다. 모든 국민은 학문과 예술의 자유를 가진다. 모든 국민은 그 보호하는 자녀에게 적어도 초등교육과 법률이 정하는 교육을 받게 할 의무를 진다.</p> <p>혼인과 가족생활은 개인의 존엄과 양성의 평등을 기초로 성립되고 유지되어야 하며, 국가는 이를 보장한다. 모든 국민은 인간다운 생활을 할 권리를 가진다. 국무총리 또는 행정각부의 장은 소관사무에 관하여 법률이나 대통령령의 위임 또는 직권으로 총리령 또는 부령을 발할 수 있다. 대법원과 각급법원의 조직은 법률로 정한다.</p> <p>대통령은 법률안의 일부에 대하여 또는 법률안을 수정하여 재의를 요구할 수 없다. 사법권은 법관으로 구성된 법원에 속한다. 재산권의 행사는 공공복리에 적합하도록 하여야 한다. 신체장애자 및 질병·노령 기타의 사유로 생활능력이 없는 국민은 법률이 정하는 바에 의하여 국가의 보호를 받는다. 국무위원은 국무총리의 제청으로 대통령이 임명한다.</p>',
              author: {
                nick: 'Destiny',
                icon: {
                  img: 'icon_1.png'
                },
                sex: 1,
                avatar_img: null
              },
              categories: {
                club: {
                  title: '헤어',
                  category: {
                    title: '탈모',
                    forum: {
                      title: '탈모치료제'
                    }
                  }
                }
              },
              created_at: '2016-12-12 13:23',
              view_count: '1,232',
              like_count: '1,232',
              comment_count: '322'
            }
          ],
          collection: {
            current_page: 1,
            limit: 10,
            next_page: 2,
            total: 20
          }
        }
      },
      SigninStore: {
        emailDup: null,
        nickDup: null,
        emailRequested: null,
        submitResult: false,
        emailVerifySuccess: false,
        emailVerifyFail: false
      }
    });
  }

});

router.get('/signin', function (req, res, next) {

  res.json({
    GnbStore: {
      openGnb: false,
      gnbMenu: {
        openSideNow: null,
        data: [
          {
            "id": 1,
            "title": "바디/헤어",
            "order": 0,
            "description": "바디/헤어",
            "using": true,
            "category_groups": [
              {
                "using": "1",
                "categories": [
                  {
                    "forums": [
                      {
                        "using": "1",
                        "id": 1,
                        "order": "0",
                        "title": "샴푸/린스",
                        "category_id": 1,
                        "prefixes": [
                          {
                            "id": 1,
                            "name": "기능성 샴푸",
                            "forum_id": 1
                          },
                          {
                            "id": 2,
                            "name": "한방 샴푸",
                            "forum_id": 1
                          }
                        ],
                        "description": "샴푸/린스"
                      },
                      {
                        "using": "1",
                        "id": 2,
                        "order": "1",
                        "title": "트리트먼트/에센스",
                        "category_id": 1,
                        "prefixes": [
                        ],
                        "description": "트리트먼스/에센스"
                      },
                      {
                        "using": "1",
                        "id": 3,
                        "order": "2",
                        "title": "탈모",
                        "category_id": 1,
                        "prefixes": [
                        ],
                        "description": "탈모"
                      }
                    ],
                    "using": "1",
                    "id": 1,
                    "order": "0",
                    "title": "헤어케어",
                    "club_category_group_id": 1,
                    "description": "헤어케어"
                  },
                  {
                    "forums": [
                      {
                        "using": "1",
                        "id": 4,
                        "order": "0",
                        "title": "스타일링",
                        "category_id": 2,
                        "prefixes": [
                        ],
                        "description": "스타일링"
                      },
                      {
                        "using": "1",
                        "id": 5,
                        "order": "1",
                        "title": "염색",
                        "category_id": 2,
                        "prefixes": [
                        ],
                        "description": "염색"
                      },
                      {
                        "using": "1",
                        "id": 6,
                        "order": "2",
                        "title": "파마",
                        "category_id": 2,
                        "prefixes": [
                        ],
                        "description": "파마"
                      }
                    ],
                    "using": "1",
                    "id": 2,
                    "order": "1",
                    "title": "헤어스타일링",
                    "club_category_group_id": 1,
                    "description": "헤어스타일링"
                  }
                ],
                "id": 1,
                "title": "헤어",
                "order": "0",
                "club_id": 1,
                "description": "헤어"
              },
              {
                "using": "1",
                "categories": [
                  {
                    "forums": [
                      {
                        "using": "1",
                        "id": 7,
                        "order": "0",
                        "title": "바디워시",
                        "category_id": 3,
                        "prefixes": [
                        ],
                        "description": "바디워시"
                      },
                      {
                        "using": "1",
                        "id": 8,
                        "order": "1",
                        "title": "청결제",
                        "category_id": 3,
                        "prefixes": [
                        ],
                        "description": "청결제"
                      },
                      {
                        "using": "1",
                        "id": 9,
                        "order": "2",
                        "title": "입욕제",
                        "category_id": 3,
                        "prefixes": [
                        ],
                        "description": "입욕제"
                      },
                      {
                        "using": "1",
                        "id": 10,
                        "order": "3",
                        "title": "제모용품",
                        "category_id": 3,
                        "prefixes": [
                        ],
                        "description": "제모용품"
                      },
                      {
                        "using": "1",
                        "id": 11,
                        "order": "4",
                        "title": "데오드란트",
                        "category_id": 3,
                        "prefixes": [
                        ],
                        "description": "데오드란트"
                      },
                      {
                        "using": "1",
                        "id": 12,
                        "order": "5",
                        "title": "태닝용품",
                        "category_id": 3,
                        "prefixes": [
                        ],
                        "description": "태닝용품"
                      }
                    ],
                    "using": "1",
                    "id": 3,
                    "order": "0",
                    "title": "바디케어",
                    "club_category_group_id": 2,
                    "description": "바디케어"
                  },
                  {
                    "forums": [
                      {
                        "using": "1",
                        "id": 13,
                        "order": "0",
                        "title": "바디로션",
                        "category_id": 4,
                        "prefixes": [
                        ],
                        "description": "바디로션"
                      },
                      {
                        "using": "1",
                        "id": 14,
                        "order": "1",
                        "title": "핸드풋케어",
                        "category_id": 4,
                        "prefixes": [
                        ],
                        "description": "핸드풋케어"
                      },
                      {
                        "using": "1",
                        "id": 15,
                        "order": "2",
                        "title": "립케어",
                        "category_id": 4,
                        "prefixes": [
                        ],
                        "description": "립케어"
                      }
                    ],
                    "using": "1",
                    "id": 4,
                    "order": "1",
                    "title": "바디로션/핸드크림",
                    "club_category_group_id": 2,
                    "description": "바디로션/핸드크림"
                  },
                  {
                    "forums": [
                      {
                        "using": "1",
                        "id": 16,
                        "order": "0",
                        "title": "면도용품",
                        "category_id": 5,
                        "prefixes": [
                        ],
                        "description": "면도"
                      },
                      {
                        "using": "1",
                        "id": 17,
                        "order": "1",
                        "title": "칫솔",
                        "category_id": 5,
                        "prefixes": [
                        ],
                        "description": "칫솔"
                      },
                      {
                        "using": "1",
                        "id": 18,
                        "order": "2",
                        "title": "비누",
                        "category_id": 5,
                        "prefixes": [
                        ],
                        "description": "비누"
                      }
                    ],
                    "using": "1",
                    "id": 5,
                    "order": "2",
                    "title": "세면",
                    "club_category_group_id": 2,
                    "description": "세면"
                  }
                ],
                "id": 2,
                "title": "바디",
                "order": "1",
                "club_id": 1,
                "description": "바디"
              }
            ]
          },
          {
            "id": 2,
            "title": "탈모",
            "order": 0,
            "description": "바디/헤어",
            "using": true,
            "category_groups": [
              {
                "using": "1",
                "categories": [
                  {
                    "forums": [
                      {
                        "using": "1",
                        "id": 1,
                        "order": "0",
                        "title": "샴푸/린스",
                        "category_id": 1,
                        "prefixes": [
                          {
                            "id": 1,
                            "name": "기능성 샴푸",
                            "forum_id": 1
                          },
                          {
                            "id": 2,
                            "name": "한방 샴푸",
                            "forum_id": 1
                          }
                        ],
                        "description": "샴푸/린스"
                      },
                      {
                        "using": "1",
                        "id": 2,
                        "order": "1",
                        "title": "트리트먼트/에센스",
                        "category_id": 1,
                        "prefixes": [
                        ],
                        "description": "트리트먼스/에센스"
                      },
                      {
                        "using": "1",
                        "id": 3,
                        "order": "2",
                        "title": "탈모",
                        "category_id": 1,
                        "prefixes": [
                        ],
                        "description": "탈모"
                      }
                    ],
                    "using": "1",
                    "id": 1,
                    "order": "0",
                    "title": "탈모케어",
                    "club_category_group_id": 1,
                    "description": "헤어케어"
                  },
                  {
                    "forums": [
                      {
                        "using": "1",
                        "id": 4,
                        "order": "0",
                        "title": "스타일링",
                        "category_id": 2,
                        "prefixes": [
                        ],
                        "description": "스타일링"
                      },
                      {
                        "using": "1",
                        "id": 5,
                        "order": "1",
                        "title": "염색",
                        "category_id": 2,
                        "prefixes": [
                        ],
                        "description": "염색"
                      },
                      {
                        "using": "1",
                        "id": 6,
                        "order": "2",
                        "title": "파마",
                        "category_id": 2,
                        "prefixes": [
                        ],
                        "description": "파마"
                      }
                    ],
                    "using": "1",
                    "id": 2,
                    "order": "1",
                    "title": "헤어스타일링",
                    "club_category_group_id": 1,
                    "description": "헤어스타일링"
                  }
                ],
                "id": 1,
                "title": "헤어",
                "order": "0",
                "club_id": 1,
                "description": "헤어"
              },
              {
                "using": "1",
                "categories": [
                  {
                    "forums": [
                      {
                        "using": "1",
                        "id": 7,
                        "order": "0",
                        "title": "바디워시",
                        "category_id": 3,
                        "prefixes": [
                        ],
                        "description": "바디워시"
                      },
                      {
                        "using": "1",
                        "id": 8,
                        "order": "1",
                        "title": "청결제",
                        "category_id": 3,
                        "prefixes": [
                        ],
                        "description": "청결제"
                      },
                      {
                        "using": "1",
                        "id": 9,
                        "order": "2",
                        "title": "입욕제",
                        "category_id": 3,
                        "prefixes": [
                        ],
                        "description": "입욕제"
                      },
                      {
                        "using": "1",
                        "id": 10,
                        "order": "3",
                        "title": "제모용품",
                        "category_id": 3,
                        "prefixes": [
                        ],
                        "description": "제모용품"
                      },
                      {
                        "using": "1",
                        "id": 11,
                        "order": "4",
                        "title": "데오드란트",
                        "category_id": 3,
                        "prefixes": [
                        ],
                        "description": "데오드란트"
                      },
                      {
                        "using": "1",
                        "id": 12,
                        "order": "5",
                        "title": "태닝용품",
                        "category_id": 3,
                        "prefixes": [
                        ],
                        "description": "태닝용품"
                      }
                    ],
                    "using": "1",
                    "id": 3,
                    "order": "0",
                    "title": "바디케어",
                    "club_category_group_id": 2,
                    "description": "바디케어"
                  },
                  {
                    "forums": [
                      {
                        "using": "1",
                        "id": 13,
                        "order": "0",
                        "title": "바디로션",
                        "category_id": 4,
                        "prefixes": [
                        ],
                        "description": "바디로션"
                      },
                      {
                        "using": "1",
                        "id": 14,
                        "order": "1",
                        "title": "핸드풋케어",
                        "category_id": 4,
                        "prefixes": [
                        ],
                        "description": "핸드풋케어"
                      },
                      {
                        "using": "1",
                        "id": 15,
                        "order": "2",
                        "title": "립케어",
                        "category_id": 4,
                        "prefixes": [
                        ],
                        "description": "립케어"
                      }
                    ],
                    "using": "1",
                    "id": 4,
                    "order": "1",
                    "title": "바디로션/핸드크림",
                    "club_category_group_id": 2,
                    "description": "바디로션/핸드크림"
                  },
                  {
                    "forums": [
                      {
                        "using": "1",
                        "id": 16,
                        "order": "0",
                        "title": "면도용품",
                        "category_id": 5,
                        "prefixes": [
                        ],
                        "description": "면도"
                      },
                      {
                        "using": "1",
                        "id": 17,
                        "order": "1",
                        "title": "칫솔",
                        "category_id": 5,
                        "prefixes": [
                        ],
                        "description": "칫솔"
                      },
                      {
                        "using": "1",
                        "id": 18,
                        "order": "2",
                        "title": "비누",
                        "category_id": 5,
                        "prefixes": [
                        ],
                        "description": "비누"
                      }
                    ],
                    "using": "1",
                    "id": 5,
                    "order": "2",
                    "title": "세면",
                    "club_category_group_id": 2,
                    "description": "세면"
                  }
                ],
                "id": 2,
                "title": "바디",
                "order": "1",
                "club_id": 1,
                "description": "바디"
              }
            ]
          }
        ]
      },
      categoryMenu: {
        categories: [{
          "id": 3,
          "title": "회원가입",
          "order": 0,
          "description": "바디/헤어",
          "using": true,
          "category_groups": [
            {
              "using": "1",
              "categories": [
                {
                  "forums": [
                    {
                      "id": 37,
                      "title": "샴푸/린스",
                      "order": "0",
                      "description": "샴푸/린스",
                      "using": "1",
                      "category_id": 11
                    },
                    {
                      "id": 38,
                      "title": "트리트먼트/에센스",
                      "order": "1",
                      "description": "트리트먼스/에센스",
                      "using": "1",
                      "category_id": 11
                    },
                    {
                      "id": 39,
                      "title": "탈모",
                      "order": "2",
                      "description": "탈모",
                      "using": "1",
                      "category_id": 11
                    }
                  ],
                  "using": "1",
                  "id": 11,
                  "order": "0",
                  "title": "헤어케어",
                  "club_category_group_id": 5,
                  "description": "헤어케어"
                },
                {
                  "forums": [
                    {
                      "id": 40,
                      "title": "스타일링",
                      "order": "0",
                      "description": "스타일링",
                      "using": "1",
                      "category_id": 12
                    },
                    {
                      "id": 41,
                      "title": "염색",
                      "order": "1",
                      "description": "염색",
                      "using": "1",
                      "category_id": 12
                    },
                    {
                      "id": 42,
                      "title": "파마",
                      "order": "2",
                      "description": "파마",
                      "using": "1",
                      "category_id": 12
                    }
                  ],
                  "using": "1",
                  "id": 12,
                  "order": "1",
                  "title": "헤어스타일링",
                  "club_category_group_id": 5,
                  "description": "헤어스타일링"
                }
              ],
              "id": 5,
              "title": "헤어",
              "order": "0",
              "club_id": 3,
              "description": "헤어"
            },
            {
              "using": "1",
              "categories": [
                {
                  "forums": [
                    {
                      "id": 43,
                      "title": "바디워시",
                      "order": "0",
                      "description": "바디워시",
                      "using": "1",
                      "category_id": 13
                    },
                    {
                      "id": 44,
                      "title": "청결제",
                      "order": "1",
                      "description": "청결제",
                      "using": "1",
                      "category_id": 13
                    },
                    {
                      "id": 45,
                      "title": "입욕제",
                      "order": "2",
                      "description": "입욕제",
                      "using": "1",
                      "category_id": 13
                    },
                    {
                      "id": 46,
                      "title": "제모용품",
                      "order": "3",
                      "description": "제모용품",
                      "using": "1",
                      "category_id": 13
                    },
                    {
                      "id": 47,
                      "title": "데오드란트",
                      "order": "4",
                      "description": "데오드란트",
                      "using": "1",
                      "category_id": 13
                    },
                    {
                      "id": 48,
                      "title": "태닝용품",
                      "order": "5",
                      "description": "태닝용품",
                      "using": "1",
                      "category_id": 13
                    }
                  ],
                  "using": "1",
                  "id": 13,
                  "order": "0",
                  "title": "바디케어",
                  "club_category_group_id": 6,
                  "description": "바디케어"
                },
                {
                  "forums": [
                    {
                      "id": 49,
                      "title": "바디로션",
                      "order": "0",
                      "description": "바디로션",
                      "using": "1",
                      "category_id": 14
                    },
                    {
                      "id": 50,
                      "title": "핸드풋케어",
                      "order": "1",
                      "description": "핸드풋케어",
                      "using": "1",
                      "category_id": 14
                    },
                    {
                      "id": 51,
                      "title": "립케어",
                      "order": "2",
                      "description": "립케어",
                      "using": "1",
                      "category_id": 14
                    }
                  ],
                  "using": "1",
                  "id": 14,
                  "order": "1",
                  "title": "바디로션/핸드크림",
                  "club_category_group_id": 6,
                  "description": "바디로션/핸드크림"
                },
                {
                  "forums": [
                    {
                      "id": 52,
                      "title": "면도용품",
                      "order": "0",
                      "description": "면도",
                      "using": "1",
                      "category_id": 15
                    },
                    {
                      "id": 53,
                      "title": "칫솔",
                      "order": "1",
                      "description": "칫솔",
                      "using": "1",
                      "category_id": 15
                    },
                    {
                      "id": 54,
                      "title": "비누",
                      "order": "2",
                      "description": "비누",
                      "using": "1",
                      "category_id": 15
                    }
                  ],
                  "using": "1",
                  "id": 15,
                  "order": "2",
                  "title": "세면",
                  "club_category_group_id": 6,
                  "description": "세면"
                }
              ],
              "id": 6,
              "title": "바디",
              "order": "1",
              "club_id": 3,
              "description": "바디"
            }
          ]
        }]
      }
    },
    LoginStore: res.resultData.LoginStore,
    UserStore: {
      user: res.resultData.UserStore.user,
      trendbox: res.resultData.UserStore.trendbox,
      profile: res.resultData.UserStore.profile,
      icon: {
        id: 1,
        img: 'icon_1.png'
      },
      grade: {
        name: '브론즈',
        img: 'grade_bronze.png'
      }
    },
    BestPostStore: {
      posts: {
        data: []
      }
    },
    SigninStore: {
      emailDup: null,
      nickDup: null,
      emailRequested: null,
      submitResult: false,
      emailVerifySuccess: false,
      emailVerifyFail: false
    }
  });
});

router.get('/community/submit', function (req, res, next) {
  res.json({
    CommunityStore: {
      type: 'post',
      post: {
        id: 1,
        title: '트랜드 클리어를 소개합니다',
        content: '<p>대통령후보자가 1인일 때에는 그 득표수가 선거권자 총수의 3분의 1 이상이 아니면 대통령으로 당선될 수 없다. 모든 국민은 근로의 권리를 가진다. 국가는 사회적·경제적 방법으로 근로자의 고용의 증진과 적정임금의 보장에 노력하여야 하며, 법률이 정하는 바에 의하여 최저임금제를 시행하여야 한다.</p> <p>사면·감형 및 복권에 관한 사항은 법률로 정한다. 모든 국민은 법 앞에 평등하다. 누구든지 성별·종교 또는 사회적 신분에 의하여 정치적·경제적·사회적·문화적 생활의 모든 영역에 있어서 차별을 받지 아니한다. 대통령은 헌법과 법률이 정하는 바에 의하여 국군을 통수한다. 국회의원은 그 지위를 남용하여 국가·공공단체 또는 기업체와의 계약이나 그 처분에 의하여 재산상의 권리·이익 또는 직위를 취득하거나 타인을 위하여 그 취득을 알선할 수 없다.</p> <p>모든 국민은 법률이 정하는 바에 의하여 납세의 의무를 진다. 국가는 농수산물의 수급균형과 유통구조의 개선에 노력하여 가격안정을 도모함으로써 농·어민의 이익을 보호한다. 각급 선거관리위원회는 선거인명부의 작성등 선거사무와 국민투표사무에 관하여 관계 행정기관에 필요한 지시를 할 수 있다.</p> <p>지방자치단체는 주민의 복리에 관한 사무를 처리하고 재산을 관리하며, 법령의 범위안에서 자치에 관한 규정을 제정할 수 있다. 사회적 특수계급의 제도는 인정되지 아니하며, 어떠한 형태로도 이를 창설할 수 없다. 국가는 주택개발정책등을 통하여 모든 국민이 쾌적한 주거생활을 할 수 있도록 노력하여야 한다.</p> <p>법률안에 이의가 있을 때에는 대통령은 제1항의 기간내에 이의서를 붙여 국회로 환부하고, 그 재의를 요구할 수 있다. 국회의 폐회중에도 또한 같다. 정당의 설립은 자유이며, 복수정당제는 보장된다. 대통령은 제3항과 제4항의 사유를 지체없이 공포하여야 한다. 대통령이 궐위되거나 사고로 인하여 직무를 수행할 수 없을 때에는 국무총리, 법률이 정한 국무위원의 순서로 그 권한을 대행한다.</p> <p>행정각부의 설치·조직과 직무범위는 법률로 정한다. 국가안전보장회의의 조직·직무범위 기타 필요한 사항은 법률로 정한다. 원장은 국회의 동의를 얻어 대통령이 임명하고, 그 임기는 4년으로 하며, 1차에 한하여 중임할 수 있다. 모든 국민은 학문과 예술의 자유를 가진다. 모든 국민은 그 보호하는 자녀에게 적어도 초등교육과 법률이 정하는 교육을 받게 할 의무를 진다.</p> <p>혼인과 가족생활은 개인의 존엄과 양성의 평등을 기초로 성립되고 유지되어야 하며, 국가는 이를 보장한다. 모든 국민은 인간다운 생활을 할 권리를 가진다. 국무총리 또는 행정각부의 장은 소관사무에 관하여 법률이나 대통령령의 위임 또는 직권으로 총리령 또는 부령을 발할 수 있다. 대법원과 각급법원의 조직은 법률로 정한다.</p> <p>대통령은 법률안의 일부에 대하여 또는 법률안을 수정하여 재의를 요구할 수 없다. 사법권은 법관으로 구성된 법원에 속한다. 재산권의 행사는 공공복리에 적합하도록 하여야 한다. 신체장애자 및 질병·노령 기타의 사유로 생활능력이 없는 국민은 법률이 정하는 바에 의하여 국가의 보호를 받는다. 국무위원은 국무총리의 제청으로 대통령이 임명한다.</p>',
        author: {
          nick: 'Destiny',
          icon: {
            img: 'icon_1.png'
          },
          sex: 1,
          avatar_img: null
        },
        categories: {
          club: {
            title: '헤어',
            category: {
              title: '탈모',
              forum: {
                title: '탈모치료제'
              }
            }
          }
        },
        created_at: '2016-12-12 13:23',
        view_count: '1,232',
        like_count: '1,232',
        comment_count: '322'
      },
      "club": {
        "id": 1,
        "order": 0,
        "title": "공지사항",
        "created_at": "2016-04-27T08:02:49.000Z",
        "ClubGroup": {
          "using": true,
          "id": 1,
          "created_at": "2016-04-27T08:02:49.000Z",
          "title": "공지",
          "order": 0,
          "user_id": 1,
          "description": "공지게시판 입니다",
          "updated_at": "2016-04-27T08:02:49.000Z"
        },
        "club_group_id": 1,
        "description": "공지게시판 입니다",
        "user_id": 1,
        "updated_at": "2016-04-27T08:02:49.000Z",
        "url": "notice"
      },
      "list": {
        "page": 1,
        "data": [
          {
            "id": 325,
            "comment_count": 50,
            "Prefix": null,
            "prefix_id": null,
            "User": {
              "nick": "고블린클럽"
            },
            "club_id": 1,
            "created_at": "3분 전",
            "Club": {
              "title": "공지사항",
              "url": "notice"
            },
            "user_id": 1,
            "has_img": false,
            "title": "The title 19",
            "view_count": 0,
            "deleted": false,
            "like_count": 0,
            "updated_at": "3분 전",
            "has_video": false,
            "content": "content19"
          },
          {
            "id": 308,
            "comment_count": 50,
            "Prefix": null,
            "prefix_id": null,
            "User": {
              "nick": "고블린클럽"
            },
            "club_id": 1,
            "created_at": "3분 전",
            "Club": {
              "title": "공지사항",
              "url": "notice"
            },
            "user_id": 1,
            "has_img": false,
            "title": "The title 18",
            "view_count": 0,
            "deleted": false,
            "like_count": 0,
            "updated_at": "3분 전",
            "has_video": false,
            "content": "content18"
          },
          {
            "id": 291,
            "comment_count": 50,
            "Prefix": null,
            "prefix_id": null,
            "User": {
              "nick": "고블린클럽"
            },
            "club_id": 1,
            "created_at": "3분 전",
            "Club": {
              "title": "공지사항",
              "url": "notice"
            },
            "user_id": 1,
            "has_img": false,
            "title": "The title 17",
            "view_count": 0,
            "deleted": false,
            "like_count": 0,
            "updated_at": "3분 전",
            "has_video": false,
            "content": "content17"
          },
          {
            "id": 274,
            "comment_count": 50,
            "Prefix": null,
            "prefix_id": null,
            "User": {
              "nick": "고블린클럽"
            },
            "club_id": 1,
            "created_at": "3분 전",
            "Club": {
              "title": "공지사항",
              "url": "notice"
            },
            "user_id": 1,
            "has_img": false,
            "title": "The title 16",
            "view_count": 0,
            "deleted": false,
            "like_count": 0,
            "updated_at": "3분 전",
            "has_video": false,
            "content": "content16"
          },
          {
            "id": 257,
            "comment_count": 50,
            "Prefix": null,
            "prefix_id": null,
            "User": {
              "nick": "고블린클럽"
            },
            "club_id": 1,
            "created_at": "3분 전",
            "Club": {
              "title": "공지사항",
              "url": "notice"
            },
            "user_id": 1,
            "has_img": false,
            "title": "The title 15",
            "view_count": 0,
            "deleted": false,
            "like_count": 0,
            "updated_at": "3분 전",
            "has_video": false,
            "content": "content15"
          },
          {
            "id": 240,
            "comment_count": 50,
            "Prefix": null,
            "prefix_id": null,
            "User": {
              "nick": "고블린클럽"
            },
            "club_id": 1,
            "created_at": "3분 전",
            "Club": {
              "title": "공지사항",
              "url": "notice"
            },
            "user_id": 1,
            "has_img": false,
            "title": "The title 14",
            "view_count": 0,
            "deleted": false,
            "like_count": 0,
            "updated_at": "3분 전",
            "has_video": false,
            "content": "content14"
          },
          {
            "id": 223,
            "comment_count": 50,
            "Prefix": null,
            "prefix_id": null,
            "User": {
              "nick": "고블린클럽"
            },
            "club_id": 1,
            "created_at": "3분 전",
            "Club": {
              "title": "공지사항",
              "url": "notice"
            },
            "user_id": 1,
            "has_img": false,
            "title": "The title 13",
            "view_count": 0,
            "deleted": false,
            "like_count": 0,
            "updated_at": "3분 전",
            "has_video": false,
            "content": "content13"
          },
          {
            "id": 206,
            "comment_count": 50,
            "Prefix": null,
            "prefix_id": null,
            "User": {
              "nick": "고블린클럽"
            },
            "club_id": 1,
            "created_at": "3분 전",
            "Club": {
              "title": "공지사항",
              "url": "notice"
            },
            "user_id": 1,
            "has_img": false,
            "title": "The title 12",
            "view_count": 0,
            "deleted": false,
            "like_count": 0,
            "updated_at": "3분 전",
            "has_video": false,
            "content": "content12"
          },
          {
            "id": 189,
            "comment_count": 50,
            "Prefix": null,
            "prefix_id": null,
            "User": {
              "nick": "고블린클럽"
            },
            "club_id": 1,
            "created_at": "3분 전",
            "Club": {
              "title": "공지사항",
              "url": "notice"
            },
            "user_id": 1,
            "has_img": false,
            "title": "The title 11",
            "view_count": 0,
            "deleted": false,
            "like_count": 0,
            "updated_at": "3분 전",
            "has_video": false,
            "content": "content11"
          },
          {
            "id": 172,
            "comment_count": 50,
            "Prefix": null,
            "prefix_id": null,
            "User": {
              "nick": "고블린클럽"
            },
            "club_id": 1,
            "created_at": "3분 전",
            "Club": {
              "title": "공지사항",
              "url": "notice"
            },
            "user_id": 1,
            "has_img": false,
            "title": "The title 10",
            "view_count": 0,
            "deleted": false,
            "like_count": 0,
            "updated_at": "3분 전",
            "has_video": false,
            "content": "content10"
          }
        ],
        "total": 21,
        "limit": 10
      }
    },
    GnbStore: {
      openGnb: false,
      gnbMenu: {
        openSideNow: null,
        data: [
          {
            "id": 1,
            "title": "바디/헤어",
            "order": 0,
            "description": "바디/헤어",
            "using": true,
            "category_groups": [
              {
                "using": "1",
                "categories": [
                  {
                    "forums": [
                      {
                        "using": "1",
                        "id": 1,
                        "order": "0",
                        "title": "샴푸/린스",
                        "category_id": 1,
                        "prefixes": [
                          {
                            "id": 1,
                            "name": "기능성 샴푸",
                            "forum_id": 1
                          },
                          {
                            "id": 2,
                            "name": "한방 샴푸",
                            "forum_id": 1
                          }
                        ],
                        "description": "샴푸/린스"
                      },
                      {
                        "using": "1",
                        "id": 2,
                        "order": "1",
                        "title": "트리트먼트/에센스",
                        "category_id": 1,
                        "prefixes": [],
                        "description": "트리트먼스/에센스"
                      },
                      {
                        "using": "1",
                        "id": 3,
                        "order": "2",
                        "title": "탈모",
                        "category_id": 1,
                        "prefixes": [],
                        "description": "탈모"
                      }
                    ],
                    "using": "1",
                    "id": 1,
                    "order": "0",
                    "title": "헤어케어",
                    "club_category_group_id": 1,
                    "description": "헤어케어"
                  },
                  {
                    "forums": [
                      {
                        "using": "1",
                        "id": 4,
                        "order": "0",
                        "title": "스타일링",
                        "category_id": 2,
                        "prefixes": [],
                        "description": "스타일링"
                      },
                      {
                        "using": "1",
                        "id": 5,
                        "order": "1",
                        "title": "염색",
                        "category_id": 2,
                        "prefixes": [],
                        "description": "염색"
                      },
                      {
                        "using": "1",
                        "id": 6,
                        "order": "2",
                        "title": "파마",
                        "category_id": 2,
                        "prefixes": [],
                        "description": "파마"
                      }
                    ],
                    "using": "1",
                    "id": 2,
                    "order": "1",
                    "title": "헤어스타일링",
                    "club_category_group_id": 1,
                    "description": "헤어스타일링"
                  }
                ],
                "id": 1,
                "title": "헤어",
                "order": "0",
                "club_id": 1,
                "description": "헤어"
              },
              {
                "using": "1",
                "categories": [
                  {
                    "forums": [
                      {
                        "using": "1",
                        "id": 7,
                        "order": "0",
                        "title": "바디워시",
                        "category_id": 3,
                        "prefixes": [],
                        "description": "바디워시"
                      },
                      {
                        "using": "1",
                        "id": 8,
                        "order": "1",
                        "title": "청결제",
                        "category_id": 3,
                        "prefixes": [],
                        "description": "청결제"
                      },
                      {
                        "using": "1",
                        "id": 9,
                        "order": "2",
                        "title": "입욕제",
                        "category_id": 3,
                        "prefixes": [],
                        "description": "입욕제"
                      },
                      {
                        "using": "1",
                        "id": 10,
                        "order": "3",
                        "title": "제모용품",
                        "category_id": 3,
                        "prefixes": [],
                        "description": "제모용품"
                      },
                      {
                        "using": "1",
                        "id": 11,
                        "order": "4",
                        "title": "데오드란트",
                        "category_id": 3,
                        "prefixes": [],
                        "description": "데오드란트"
                      },
                      {
                        "using": "1",
                        "id": 12,
                        "order": "5",
                        "title": "태닝용품",
                        "category_id": 3,
                        "prefixes": [],
                        "description": "태닝용품"
                      }
                    ],
                    "using": "1",
                    "id": 3,
                    "order": "0",
                    "title": "바디케어",
                    "club_category_group_id": 2,
                    "description": "바디케어"
                  },
                  {
                    "forums": [
                      {
                        "using": "1",
                        "id": 13,
                        "order": "0",
                        "title": "바디로션",
                        "category_id": 4,
                        "prefixes": [],
                        "description": "바디로션"
                      },
                      {
                        "using": "1",
                        "id": 14,
                        "order": "1",
                        "title": "핸드풋케어",
                        "category_id": 4,
                        "prefixes": [],
                        "description": "핸드풋케어"
                      },
                      {
                        "using": "1",
                        "id": 15,
                        "order": "2",
                        "title": "립케어",
                        "category_id": 4,
                        "prefixes": [],
                        "description": "립케어"
                      }
                    ],
                    "using": "1",
                    "id": 4,
                    "order": "1",
                    "title": "바디로션/핸드크림",
                    "club_category_group_id": 2,
                    "description": "바디로션/핸드크림"
                  },
                  {
                    "forums": [
                      {
                        "using": "1",
                        "id": 16,
                        "order": "0",
                        "title": "면도용품",
                        "category_id": 5,
                        "prefixes": [],
                        "description": "면도"
                      },
                      {
                        "using": "1",
                        "id": 17,
                        "order": "1",
                        "title": "칫솔",
                        "category_id": 5,
                        "prefixes": [],
                        "description": "칫솔"
                      },
                      {
                        "using": "1",
                        "id": 18,
                        "order": "2",
                        "title": "비누",
                        "category_id": 5,
                        "prefixes": [],
                        "description": "비누"
                      }
                    ],
                    "using": "1",
                    "id": 5,
                    "order": "2",
                    "title": "세면",
                    "club_category_group_id": 2,
                    "description": "세면"
                  }
                ],
                "id": 2,
                "title": "바디",
                "order": "1",
                "club_id": 1,
                "description": "바디"
              }
            ]
          },
          {
            "id": 2,
            "title": "탈모",
            "order": 0,
            "description": "바디/헤어",
            "using": true,
            "category_groups": [
              {
                "using": "1",
                "categories": [
                  {
                    "forums": [
                      {
                        "using": "1",
                        "id": 1,
                        "order": "0",
                        "title": "샴푸/린스",
                        "category_id": 1,
                        "prefixes": [
                          {
                            "id": 1,
                            "name": "기능성 샴푸",
                            "forum_id": 1
                          },
                          {
                            "id": 2,
                            "name": "한방 샴푸",
                            "forum_id": 1
                          }
                        ],
                        "description": "샴푸/린스"
                      },
                      {
                        "using": "1",
                        "id": 2,
                        "order": "1",
                        "title": "트리트먼트/에센스",
                        "category_id": 1,
                        "prefixes": [],
                        "description": "트리트먼스/에센스"
                      },
                      {
                        "using": "1",
                        "id": 3,
                        "order": "2",
                        "title": "탈모",
                        "category_id": 1,
                        "prefixes": [],
                        "description": "탈모"
                      }
                    ],
                    "using": "1",
                    "id": 1,
                    "order": "0",
                    "title": "탈모케어",
                    "club_category_group_id": 1,
                    "description": "헤어케어"
                  },
                  {
                    "forums": [
                      {
                        "using": "1",
                        "id": 4,
                        "order": "0",
                        "title": "스타일링",
                        "category_id": 2,
                        "prefixes": [],
                        "description": "스타일링"
                      },
                      {
                        "using": "1",
                        "id": 5,
                        "order": "1",
                        "title": "염색",
                        "category_id": 2,
                        "prefixes": [],
                        "description": "염색"
                      },
                      {
                        "using": "1",
                        "id": 6,
                        "order": "2",
                        "title": "파마",
                        "category_id": 2,
                        "prefixes": [],
                        "description": "파마"
                      }
                    ],
                    "using": "1",
                    "id": 2,
                    "order": "1",
                    "title": "헤어스타일링",
                    "club_category_group_id": 1,
                    "description": "헤어스타일링"
                  }
                ],
                "id": 1,
                "title": "헤어",
                "order": "0",
                "club_id": 1,
                "description": "헤어"
              },
              {
                "using": "1",
                "categories": [
                  {
                    "forums": [
                      {
                        "using": "1",
                        "id": 7,
                        "order": "0",
                        "title": "바디워시",
                        "category_id": 3,
                        "prefixes": [],
                        "description": "바디워시"
                      },
                      {
                        "using": "1",
                        "id": 8,
                        "order": "1",
                        "title": "청결제",
                        "category_id": 3,
                        "prefixes": [],
                        "description": "청결제"
                      },
                      {
                        "using": "1",
                        "id": 9,
                        "order": "2",
                        "title": "입욕제",
                        "category_id": 3,
                        "prefixes": [],
                        "description": "입욕제"
                      },
                      {
                        "using": "1",
                        "id": 10,
                        "order": "3",
                        "title": "제모용품",
                        "category_id": 3,
                        "prefixes": [],
                        "description": "제모용품"
                      },
                      {
                        "using": "1",
                        "id": 11,
                        "order": "4",
                        "title": "데오드란트",
                        "category_id": 3,
                        "prefixes": [],
                        "description": "데오드란트"
                      },
                      {
                        "using": "1",
                        "id": 12,
                        "order": "5",
                        "title": "태닝용품",
                        "category_id": 3,
                        "prefixes": [],
                        "description": "태닝용품"
                      }
                    ],
                    "using": "1",
                    "id": 3,
                    "order": "0",
                    "title": "바디케어",
                    "club_category_group_id": 2,
                    "description": "바디케어"
                  },
                  {
                    "forums": [
                      {
                        "using": "1",
                        "id": 13,
                        "order": "0",
                        "title": "바디로션",
                        "category_id": 4,
                        "prefixes": [],
                        "description": "바디로션"
                      },
                      {
                        "using": "1",
                        "id": 14,
                        "order": "1",
                        "title": "핸드풋케어",
                        "category_id": 4,
                        "prefixes": [],
                        "description": "핸드풋케어"
                      },
                      {
                        "using": "1",
                        "id": 15,
                        "order": "2",
                        "title": "립케어",
                        "category_id": 4,
                        "prefixes": [],
                        "description": "립케어"
                      }
                    ],
                    "using": "1",
                    "id": 4,
                    "order": "1",
                    "title": "바디로션/핸드크림",
                    "club_category_group_id": 2,
                    "description": "바디로션/핸드크림"
                  },
                  {
                    "forums": [
                      {
                        "using": "1",
                        "id": 16,
                        "order": "0",
                        "title": "면도용품",
                        "category_id": 5,
                        "prefixes": [],
                        "description": "면도"
                      },
                      {
                        "using": "1",
                        "id": 17,
                        "order": "1",
                        "title": "칫솔",
                        "category_id": 5,
                        "prefixes": [],
                        "description": "칫솔"
                      },
                      {
                        "using": "1",
                        "id": 18,
                        "order": "2",
                        "title": "비누",
                        "category_id": 5,
                        "prefixes": [],
                        "description": "비누"
                      }
                    ],
                    "using": "1",
                    "id": 5,
                    "order": "2",
                    "title": "세면",
                    "club_category_group_id": 2,
                    "description": "세면"
                  }
                ],
                "id": 2,
                "title": "바디",
                "order": "1",
                "club_id": 1,
                "description": "바디"
              }
            ]
          }
        ]
      },
      categoryMenu: {
        categories: [{
          "id": 3,
          "title": "바디/헤어",
          "order": 0,
          "description": "바디/헤어",
          "using": true,
          "category_groups": [
            {
              "using": "1",
              "categories": [
                {
                  "forums": [
                    {
                      "id": 37,
                      "title": "샴푸/린스",
                      "order": "0",
                      "description": "샴푸/린스",
                      "using": "1",
                      "category_id": 11
                    },
                    {
                      "id": 38,
                      "title": "트리트먼트/에센스",
                      "order": "1",
                      "description": "트리트먼스/에센스",
                      "using": "1",
                      "category_id": 11
                    },
                    {
                      "id": 39,
                      "title": "탈모",
                      "order": "2",
                      "description": "탈모",
                      "using": "1",
                      "category_id": 11
                    }
                  ],
                  "using": "1",
                  "id": 11,
                  "order": "0",
                  "title": "헤어케어",
                  "club_category_group_id": 5,
                  "description": "헤어케어"
                },
                {
                  "forums": [
                    {
                      "id": 40,
                      "title": "스타일링",
                      "order": "0",
                      "description": "스타일링",
                      "using": "1",
                      "category_id": 12
                    },
                    {
                      "id": 41,
                      "title": "염색",
                      "order": "1",
                      "description": "염색",
                      "using": "1",
                      "category_id": 12
                    },
                    {
                      "id": 42,
                      "title": "파마",
                      "order": "2",
                      "description": "파마",
                      "using": "1",
                      "category_id": 12
                    }
                  ],
                  "using": "1",
                  "id": 12,
                  "order": "1",
                  "title": "헤어스타일링",
                  "club_category_group_id": 5,
                  "description": "헤어스타일링"
                }
              ],
              "id": 5,
              "title": "헤어",
              "order": "0",
              "club_id": 3,
              "description": "헤어"
            },
            {
              "using": "1",
              "categories": [
                {
                  "forums": [
                    {
                      "id": 43,
                      "title": "바디워시",
                      "order": "0",
                      "description": "바디워시",
                      "using": "1",
                      "category_id": 13
                    },
                    {
                      "id": 44,
                      "title": "청결제",
                      "order": "1",
                      "description": "청결제",
                      "using": "1",
                      "category_id": 13
                    },
                    {
                      "id": 45,
                      "title": "입욕제",
                      "order": "2",
                      "description": "입욕제",
                      "using": "1",
                      "category_id": 13
                    },
                    {
                      "id": 46,
                      "title": "제모용품",
                      "order": "3",
                      "description": "제모용품",
                      "using": "1",
                      "category_id": 13
                    },
                    {
                      "id": 47,
                      "title": "데오드란트",
                      "order": "4",
                      "description": "데오드란트",
                      "using": "1",
                      "category_id": 13
                    },
                    {
                      "id": 48,
                      "title": "태닝용품",
                      "order": "5",
                      "description": "태닝용품",
                      "using": "1",
                      "category_id": 13
                    }
                  ],
                  "using": "1",
                  "id": 13,
                  "order": "0",
                  "title": "바디케어",
                  "club_category_group_id": 6,
                  "description": "바디케어"
                },
                {
                  "forums": [
                    {
                      "id": 49,
                      "title": "바디로션",
                      "order": "0",
                      "description": "바디로션",
                      "using": "1",
                      "category_id": 14
                    },
                    {
                      "id": 50,
                      "title": "핸드풋케어",
                      "order": "1",
                      "description": "핸드풋케어",
                      "using": "1",
                      "category_id": 14
                    },
                    {
                      "id": 51,
                      "title": "립케어",
                      "order": "2",
                      "description": "립케어",
                      "using": "1",
                      "category_id": 14
                    }
                  ],
                  "using": "1",
                  "id": 14,
                  "order": "1",
                  "title": "바디로션/핸드크림",
                  "club_category_group_id": 6,
                  "description": "바디로션/핸드크림"
                },
                {
                  "forums": [
                    {
                      "id": 52,
                      "title": "면도용품",
                      "order": "0",
                      "description": "면도",
                      "using": "1",
                      "category_id": 15
                    },
                    {
                      "id": 53,
                      "title": "칫솔",
                      "order": "1",
                      "description": "칫솔",
                      "using": "1",
                      "category_id": 15
                    },
                    {
                      "id": 54,
                      "title": "비누",
                      "order": "2",
                      "description": "비누",
                      "using": "1",
                      "category_id": 15
                    }
                  ],
                  "using": "1",
                  "id": 15,
                  "order": "2",
                  "title": "세면",
                  "club_category_group_id": 6,
                  "description": "세면"
                }
              ],
              "id": 6,
              "title": "바디",
              "order": "1",
              "club_id": 3,
              "description": "바디"
            }
          ]
        }]
      }
    },
    LoginStore: res.resultData.LoginStore,
    UserStore: {
      user: res.resultData.UserStore.user,
      trendbox: res.resultData.UserStore.trendbox,
      profile: res.resultData.UserStore.profile,
      icon: {
        id: 1,
        img: 'icon_1.png'
      },
      grade: {
        name: '브론즈',
        img: 'grade_bronze.png'
      }
    },
    SigninStore: {
      emailDup: null,
      nickDup: null,
      emailRequested: null,
      submitResult: false,
      emailVerifySuccess: false,
      emailVerifyFail: false
    },
    BestPostStore: {
      posts: {
        data: []
      }
    }
  })
});


module.exports = router;