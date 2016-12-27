const router = require('express').Router();
const request = require('superagent');
const co = require('co');
const M = require('../../../vn-api-model/index');

router.post('/check/rp', (req, res) => {
  /* card
  {
    apply_num: '46886385',
    buyer_addr: '',
    buyer_email: 'bsdo64@gmail.com',
    buyer_name: 'nick3',
    buyer_postcode: '',
    buyer_tel: '',
    card_name: '외환카드',
    card_quota: 0,
    custom_data: null,
    imp_uid: 'imp_997533060745',
    merchant_uid: 'merchant_1482207423214',
    name: 'RP 충전',
    paid_amount: 10000,
    paid_at: 1482207569,
    pay_method: 'card',
    pg_provider: 'html5_inicis',
    pg_tid: 'StdpayCARDINIpayTest20161220131928625946',
    receipt_url: 'https://iniweb.inicis.com/DefaultWebApp/mall/cr/cm/mCmReceipt_head.jsp?noTid=StdpayCARDINIpayTest20161220131928625946&noMethod=1',
    request_id: 'req_1482207423426',
    status: 'paid',
    success: true,
  }

  // Result
   {
     imp_uid: 'imp_181744285159',
     merchant_uid: 'merchant_1482215740349',
     status: 'paid'
   }
  */

  /* phone
   {
     apply_num: ""
     buyer_addr: ""
     buyer_email: "bsdo64@gmail.com"
     buyer_name: "nick3"
     buyer_postcode: ""
     buyer_tel: ""
     card_name: ""
     card_quota: 0
     custom_data: null
     imp_uid: "imp_945503415614"
     merchant_uid: "merchant_1482209499470"
     name: "RP 충전"
     paid_amount: 10000
     paid_at: 1482209541
     pay_method: "phone"
     pg_provider: "html5_inicis"
     pg_tid: "StdpayHPP_INIpayTest20161220135220704777"
     receipt_url: "https://iniweb.inicis.com/DefaultWebApp/mall/cr/cm/mCmReceipt_head.jsp?noTid=StdpayHPP_INIpayTest20161220135220704777&noMethod=1"
     request_id: "req_1482209499667"
     status: "paid"
     success: true
   }

   // Result
   {
     imp_uid: 'imp_396631954611',
     merchant_uid: 'merchant_1482215627922',
     status: 'ready'
   }
   */

  /* vbank
  {
   apply_num: ""
   buyer_addr: ""
   buyer_email: "bsdo64@gmail.com"
   buyer_name: "nick3"
   buyer_postcode: ""
   buyer_tel: ""
   card_name: ""
   card_quota: 0
   custom_data: null
   imp_uid: "imp_612247255669"
   merchant_uid: "merchant_1482215137784"
   name: "RP 충전"
   paid_amount: 10000
   paid_at: 0
   pay_method: "vbank"
   pg_provider: "html5_inicis"
   pg_tid: "StdpayVBNKINIpayTest20161220152552413472"
   receipt_url: "https://iniweb.inicis.com/DefaultWebApp/mall/cr/cm/mCmReceipt_head.jsp?noTid=StdpayVBNKINIpayTest20161220152552413472&noMethod=1"
   request_id: "req_1482215137970"
   status: "ready"
   success: true

   // 가상계좌 전용
   vbank_date: "2017-01-19 23:59:59"
   vbank_holder: "테스트  이니시스"
   vbank_name: "하나은행"
   vbank_num: "58390665836437"
  }

  // Result
   {
     imp_uid: 'imp_396631954611',
     merchant_uid: 'merchant_1482215627922',
     status: 'ready'
   }
  */

  const user = res.locals.user;
  const imp_uid = req.body.imp_uid; //post ajax request로부터 imp_uid확인
  const amount = req.body.paid_amount; //post ajax request로부터 imp_uid확인

  if (!user || !imp_uid || !amount) {
    res.json({
      error: true,
      response: {
        message: 'Null parameter'
      }
    })
  }

  co(function* RouteHandler() {

    try {
      const getImportAccessKeyXHR = yield request
        .post('https://api.iamport.kr/users/getToken')
        .send({
          imp_key: '1467236444958442',
          imp_secret: '59TkPGNW9pImLpNcTJJNc81tR5CGjHsoRlIG1wCbWlyHLlTF5DsiLuLCAojT5LhW70D9xgluCTcnf62k'
        });

      const IamportAccessKey = getImportAccessKeyXHR.body.response.access_token;

      const paymentResultFromIamportXHR = yield request
        .post(`https://api.iamport.kr/payments/${imp_uid}`)
        .set('Authorization', IamportAccessKey)
        .send({
          imp_uid
        }); //imp_uid로 아임포트로부터 결제정보 조회

      const paymentResultFromIamport = paymentResultFromIamportXHR.body.response;

      const payment = yield M.Point.setPayment({
        amount: paymentResultFromIamport.amount,
        apply_num: paymentResultFromIamport.apply_num,
        buyer_addr: paymentResultFromIamport.buyer_addr,
        buyer_email: paymentResultFromIamport.buyer_email,
        buyer_name: paymentResultFromIamport.buyer_name,
        buyer_postcode: paymentResultFromIamport.buyer_postcode,
        buyer_tel: paymentResultFromIamport.buyer_tel,
        cancel_amount: paymentResultFromIamport.cancel_amount,
        cancel_reason: paymentResultFromIamport.cancel_reason,
        cancel_receipt_urls: JSON.stringify(paymentResultFromIamport.cancel_receipt_urls),
        cancelled_at: new Date(paymentResultFromIamport.cancelled_at * 1000),
        card_name: paymentResultFromIamport.card_name,
        card_quota: paymentResultFromIamport.card_quota,
        currency: paymentResultFromIamport.currency,
        custom_data: paymentResultFromIamport.custom_data,
        escrow: paymentResultFromIamport.escrow,
        fail_reason: paymentResultFromIamport.fail_reason,
        failed_at: new Date(paymentResultFromIamport.failed_at * 1000),
        imp_uid: paymentResultFromIamport.imp_uid,
        merchant_uid: paymentResultFromIamport.merchant_uid,
        name: paymentResultFromIamport.name,
        paid_at: new Date(paymentResultFromIamport.paid_at * 1000),
        pay_method: paymentResultFromIamport.pay_method,
        pg_provider: paymentResultFromIamport.pg_provider,
        pg_tid: paymentResultFromIamport.pg_tid,
        receipt_url: paymentResultFromIamport.receipt_url,
        status: paymentResultFromIamport.status,
        vbank_date: new Date(paymentResultFromIamport.vbank_date * 1000),
        vbank_holder: paymentResultFromIamport.vbank_holder,
        vbank_name: paymentResultFromIamport.vbank_name,
        vbank_num: paymentResultFromIamport.vbank_num,

        user_id: user.id
      });

      if (paymentResultFromIamport.status == 'paid' && paymentResultFromIamport.amount == amount) {

        yield M.Point.chargeRP(payment, user);

        res.json({
          message: 'success',
          error: false,
          response: paymentResultFromIamport
        });
      } else if (paymentResultFromIamport.status == 'ready' && paymentResultFromIamport.pay_method == 'vbank') {
        res.json({
          message: 'vbank_ready',
          error: false,
          response: paymentResultFromIamport
        });
      } else {
        res.json({
          error: true,
          response: paymentResultFromIamport
        })
      }

    }
    catch (err) {

      console.log(err);

      const result = err.response.body;

      if (result.code !== 0) {
        console.log(result.message);
      }
    }
  })

});

router.post('/noti', (req, res) => {
  const imp_uid = req.body.imp_uid;
  const merchant_uid = req.body.merchant_uid;

  co(function* RouteHandler() {

    try {
      const getImportAccessKeyXHR = yield request
        .post('https://api.iamport.kr/users/getToken')
        .send({
          imp_key: '1467236444958442',
          imp_secret: '59TkPGNW9pImLpNcTJJNc81tR5CGjHsoRlIG1wCbWlyHLlTF5DsiLuLCAojT5LhW70D9xgluCTcnf62k'
        });

      const IamportAccessKey = getImportAccessKeyXHR.body.response.access_token;

      const paymentResultFromIamportXHR = yield request
        .post(`https://api.iamport.kr/payments/${imp_uid}`)
        .set('Authorization', IamportAccessKey)
        .send({
          imp_uid
        }); //imp_uid로 아임포트로부터 결제정보 조회

      const paymentResultFromIamport = paymentResultFromIamportXHR.body.response;

      yield M.Point.updatePaymentByNoti({
        amount: paymentResultFromIamport.amount,
        apply_num: paymentResultFromIamport.apply_num,
        buyer_addr: paymentResultFromIamport.buyer_addr,
        buyer_email: paymentResultFromIamport.buyer_email,
        buyer_name: paymentResultFromIamport.buyer_name,
        buyer_postcode: paymentResultFromIamport.buyer_postcode,
        buyer_tel: paymentResultFromIamport.buyer_tel,
        cancel_amount: paymentResultFromIamport.cancel_amount,
        cancel_reason: paymentResultFromIamport.cancel_reason,
        cancel_receipt_urls: JSON.stringify(paymentResultFromIamport.cancel_receipt_urls),
        cancelled_at: new Date(paymentResultFromIamport.cancelled_at * 1000),
        card_name: paymentResultFromIamport.card_name,
        card_quota: paymentResultFromIamport.card_quota,
        currency: paymentResultFromIamport.currency,
        custom_data: paymentResultFromIamport.custom_data,
        escrow: paymentResultFromIamport.escrow,
        fail_reason: paymentResultFromIamport.fail_reason,
        failed_at: new Date(paymentResultFromIamport.failed_at * 1000),
        imp_uid: paymentResultFromIamport.imp_uid,
        merchant_uid: paymentResultFromIamport.merchant_uid,
        name: paymentResultFromIamport.name,
        paid_at: new Date(paymentResultFromIamport.paid_at * 1000),
        pay_method: paymentResultFromIamport.pay_method,
        pg_provider: paymentResultFromIamport.pg_provider,
        pg_tid: paymentResultFromIamport.pg_tid,
        receipt_url: paymentResultFromIamport.receipt_url,
        status: paymentResultFromIamport.status,
        vbank_date: new Date(paymentResultFromIamport.vbank_date * 1000),
        vbank_holder: paymentResultFromIamport.vbank_holder,
        vbank_name: paymentResultFromIamport.vbank_name,
        vbank_num: paymentResultFromIamport.vbank_num
      });

      res.json(paymentResultFromIamport);
    }

    catch (err) {
      console.error(err);

      res.json(err);
    }
  });
});

module.exports = router;
