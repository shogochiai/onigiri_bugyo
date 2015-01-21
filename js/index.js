(function(){
    var milkcocoa = new MilkCocoa("https://io-ni5704e2j.mlkcca.com:443");
    var ds_proposals = milkcocoa.dataStore("proposals");
    var ds_members = milkcocoa.dataStore("members");
    var ds_onigiris = milkcocoa.dataStore("onigiris");

    // ユーザー一覧生成
    ds_members.query({}).done(function(users){

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
                        var not_exists = !(target_proposal || target_menber);
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

    milkcocoa.getCurrentUser(function(err, data){
        var mode = decodeURI(location.hash.substr(1));

        // グループ管理者モード
        if (mode == "shogo"){
            var isShogo = (data.name == "Shogo Ochiai");
            if(isShogo){
                alert("Shogo mode :)");
                ds_proposals.query({}).done(function(users){
                    for(i=0; i++; i < data.length){
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
                            ds_proposals.query({fbid: data.fbid}).done(function(target){
                                ds_members.push({ fbid : target.fbid, name : target.name });
                            });
                        });

                        // 拒否
                        $("."+ng_cls).click(function(e){
                            ds_proposals.query({fbid: data.fbid}).done(function(target){
                                ds_proposals.remove(targer.id);
                                $("."+base_cls).hide();
                            });
                        });
                    }
                });

            } else {
              location.href = "http://"+location.host;
            }
        } else if (mode == "takenoshin"){
            var isTakenoshin = (data.name == "Takenoshin Tokutsu");
            if(isTakenoshin){
                alert("Takenoshin mode :)");
                $(".container--body").append("<button class='btn btn-danger container--body--accept'>accept onigiri!</button>");
                $(".container--body--accept").click(function(e){
                    render_accept_mode();
                });
            } else {
              location.href = "http://"+location.host;
            }
        } else if (mode == "") {
        } else {
            alert("no such hash ;p");
            location.href = "http://"+location.host;
        }


        var isLoggedIn = (err == null);
        if (isLoggedIn) {
            render_chat();
        } else {
        }
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
