(function(){
    var milkcocoa = new MilkCocoa("https://io-ni5704e2j.mlkcca.com:443");
    var ds_proposals = milkcocoa.dataStore("proposals");
    var ds_members = milkcocoa.dataStore("members");
    var ds_orders = milkcocoa.dataStore("orders");

    // おにぎりの具ボタンの表示について考える
    // たけのしんがおにぎりの具を管理できたら良い
    var onigiri_shio = "<img src='pic/onigiri.gif' class='container--body--onigiri--shio--img'>";
    $(".container--body--onigiri--shio").append(onigiri_shio);

    // ordersを削除するタイミングについて考える
    // fbに投稿するボタンについて考える

    // ユーザー一覧生成
    // いまメンバーがいないからなんかfor文の中が動作してない
    ds_members.query({}).done(function(users){
        for(var i = 0; i < users.length; i++){
            var each_user = users[i];
            var prp_cls = "container--body--orders--members";
            var base_cls = prp_cls + "--" + each_user.fbid;

            // メンバー表示
            // 注文したおにぎりを表示する描画系が必要
            // ordersデータストアの中からその人が頼んだおにぎりの個数を調べて表示する
            $("."+prp_cls).append("<p class='"+base_cls+"'>" + each_user.name + "</p>");

            // 注文表示ボタン
            // user_idを元にordersDSに検索をかけて描画する。おにぎりマークのクラスにおにぎりidを持たせる。
            ds_orders.query({user_id: each_user.fbid}).done(function(targets){
                for(var j = 0; j < targets.length; j++){
                    var target = targets[j];
                    var order_id = target.id;
                    var order_cls = base_cls + "--" + order_id;
                    var order_img_dom = "<img src='pic/onigiri.gif' width='50px' class='"+order_cls+"'>"
                    $("."+base_cls).append(order_img_dom);
                    // 注文消すボタン
                    // おにぎりidつきクラスで指定して、idを元に削除する
                    $("."+order_cls).click(function(e){
                        ds_orders.remove(order_id);
                        $("."+order_cls).hide(); //これはon関数で皆に反映させるべき
                        // 何故か更新処理が起きてる？
                    });
                }
            });
        }
    });

    // ログインボタンとグループ申請送信
    $(".container--header--login").click(function(e){
        milkcocoa.auth("facebook", function(err, user){
           switch(err){
              case null:

                /* 俺はmemberデータストアに主導で入れる。*/

                //たけのしんはメンバー申請を自動でパス。
                if (user.name == "Takenoshin Tokutsu") {
                    alert("You're Takenoshin, onigiri master :)");
                    location.reload();
                }

                // 申請中でもなくメンバーでもなければ、申請する
                ds_proposals.query({fbid:user.id}).done(function(target_proposal){
                    ds_members.query({fbid:user.id}).done(function(target_menber){
                        var not_exists = !(target_proposal.first || target_menber.first);
                        if (not_exists) {
                            ds_proposals.push({fbid:user.id,name:user.name, date: new Date()});
                            alert("Sent onigiri member proposal :)");
                        } else if (target_proposal) {
                            alert("You've already proposed, wait the acception ;)");
                        } else {
                            alert("You're onigiri member, congrats :)");
                        }
                        location.reload();
                    });
                });
                break;
              case 1:
                alert("Sorry, auth failed :(");
                break;
            }
        });
    });

    milkcocoa.getCurrentUser(function(err, current_user){

        var isLoggedIn = (err == null);
        if (isLoggedIn) {
            // ログインユーザーにだけチャットを許す
            render_chat();
        } else {
        }

        // グループ管理者モード
        var mode = decodeURI(location.hash.substr(1));
        if (mode == "shogo"){
            var isShogo = (current_user.name == "Shogo Ochiai");
            if(isShogo){
                alert("Shogo mode :)");
                ds_proposals.query({}).done(function(users){
                    for(i=0; i++; i < users.length){
                        var each_user = users[i];
                        var prp_cls = "container--body--proposals";
                        var base_cls = prp_cls + "--" + each_user.fbid;
                        var ok_cls = base_cls + "--ok";
                        var ng_cls = base_cls + "--ng";
                        var ok_btn = "<button class='btn btn-primary "+ok_cls+"'>OK</button>";
                        var ng_btn = "<button class='btn btn-primary "+ng_cls+"'>NG</button>";

                        // 申請者表示
                        $("."+prp_cls).append("<p class='"+base_cls+"'>" + each_user.name + ok_btn + ng_btn + "</p>");

                        // 承認
                        $("."+ok_cls).click(function(e){
                            ds_proposals.query({fbid: each_user.fbid}).done(function(target){
                                ds_members.push({ fbid : target.fbid, name : target.name });
                            });
                        });

                        // 拒否
                        $("."+ng_cls).click(function(e){
                            ds_proposals.query({fbid: each_user.fbid}).done(function(target){
                                ds_proposals.remove(target.id);
                                $("."+base_cls).hide();
                            });
                        });
                    }
                });

            } else {
              location.href = "http://"+location.host;
            }
        } else if (mode == "takenoshin"){
            var isTakenoshin = (current_user.name == "Takenoshin Tokutsu");
            if(isTakenoshin){
                alert("Takenoshin mode :)");
                $(".container--body").append("<button class='btn btn-danger container--body--accept'>accept onigiri!</button>");
                $(".container--body--accept").click(function(e){
                    // fbに投稿するボタンについて考える
                    render_accept_mode();
                });
                // オーダー初期化関数を考える
            } else {
              location.href = "http://"+location.host;
            }
        } else if (mode == "") {
            // current_userがmembersに含まれていたら許可
            ds_members.query({fbid:current_user.id}).done(function(targets){
                var target = targets[0];
                if(target){
                    $(".container--body--onigiri--shio").click(function(e){
                        // クリックしたcurrent_userは、ordersデータストアの自分の欄におにぎりが追加される
                        // ordersはmembersを持ち、orders-membersはおにぎりを持つ。おにぎりは種類を持つ。
                        ds_orders.push({ user_id : target.fbid, user_name: target.name, ingredient_id : 1 });
                    });
                    // おにぎりを注文できる処理
                } else {
                    $(".container--body--onigiri--shio").click(function(e){
                        alert("Member only, Sir :)");
                    });
                }
            });
        } else {
            alert("no such hash ;p");
            location.href = "http://"+location.host;
        }
    });



    /* 受動的な関数を集めておく */

    ds_orders.on("push", function(order){
        alert("accept "+order.value.user_name+"'s order!")
        // member欄に注文個数を描画して、削除ボタンを生成する
        // 単体削除関数を作成する
    });

    $(window).on('hashchange', function(){
      location.reload();
    });

    // オーダーをたけのしんが承認したときのグループ用待ちボタン
    function render_accept_mode () {
        $(".container--body").append("<h1 class='container--body--accept_mode'>accept mode!!</h1>");
    }

    // ログインしてる人用のチャット枠
    function render_chat () {
    }

    function escapeHTML(val) {
        return $('<div />').text(val).html();
    };

    var check_sp = (ua('iPhone') > 0 && ua('iPad') == -1) || ua('iPod') > 0 || ua('Android') > 0;
    if (check_sp) $(".modal-dialog").addClass('modal-sm');
    function ua(user_agent){
        return navigator.userAgent.indexOf(user_agent);
    }

})();
