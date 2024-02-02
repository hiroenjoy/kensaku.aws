$(function(){
    var recognition = new webkitSpeechRecognition() || new SpeechRecognition();
    recognition.lang = 'ja-JP'; // 日本語を使用する場合
    recognition.continuous = true; // 連続的な認識を許可
    recognition.interimResults = true; // 中間結果の取得を許可

    // テキストフィールドの値が変更されたときにラベルを非表示にする
    $('#text').on('input', function() {
        if ($(this).val() !== '') {
            $(this).siblings('label').hide();
        } else {
            $(this).siblings('label').show();
        }
    });
    /* 音声フィールドの値が変更されたときにラベルを非表示にする
    $('#speechInput').on('input', function() {
        if ($(this).val() !== '') {
            $(this).siblings('label').hide();
        } else {
            $(this).siblings('label').show();
        }
    });*/

    // ローディング画面を表示する関数
    function showLoadingScreen() {
    document.getElementById('loading-screen').classList.add('active');
    }
  
    // ローディング画面を非表示にする関数
    function hideLoadingScreen() {
    document.getElementById('loading-screen').classList.remove('active');
    }


    //音声入力をテキスト化する関数
    recognition.onresult = function(event) {
        var interim_transcript = '';
        var final_transcript = '';
        for (var i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                final_transcript += event.results[i][0].transcript;
            } else {
                interim_transcript += event.results[i][0].transcript;
            }
        }
        // ここで final_transcript や interim_transcript を使って処理を行う
        $("#speechInput").val(final_transcript);
    };

    recognition.onstart = function() {
        $("#startButton").text("停止");
        $("#startButton").show();
        $("#stopButton").hide();
    };

    recognition.onend = function() {
        $("#startButton").text("開始");
        $("#startButton").show();
        $("#stopButton").hide();
    };

    $("#toggleButton").click(function() {
        $("#textInput").toggle(); // テキスト入力フィールドの表示を切り替える
        $("#speechInputContainer").toggle(); // 音声入力フィールドの表示を切り替える
        $("#startButton").toggle(); // 開始ボタンの表示を切り替える
        //$("#stopButton").toggle(); // 停止ボタンの表示を切り替える

        if ($("#exp1").text() === "キーボードで入力してください。") {
            $("#exp1").text("言葉でしゃべってください。");
        } else {
            $("#exp1").text("キーボードで入力してください。");
        }
    });

    $("#startButton").click(function() {
        //if (recognition && recognition.state === 'idle') { // recognition オブジェクトが存在し、かつ停止中の場合に start メソッドを呼び出す
            $("#stopButton").show();
            $("#startButton").hide();
            $('#speechInput').siblings('label').hide();
            recognition.start();
       // }
    });

    $("#stopButton").click(function() {
        //if (recognition && recognition.state === 'listening') { // recognition オブジェクトが存在し、かつ認識中の場合に stop メソッドを呼び出す
            $("#stopButton").hide();
            $("#startButton").show();

            recognition.stop();
        //}
    });

    $("#submitButton").click(function() {
        $("#loading-screen").show(); // ローディング画面を表示

        $("#iframes").empty(); // ページ内の特定の要素を削除する場合
        $("response").empty(); // ページ内の特定の要素を削除する場合
        var url = "https://niwtgpxo75.execute-api.us-east-1.amazonaws.com/test";
        var JSONdata = {
            "key1": $("#text").val() || $("#speechInput").val() // テキスト入力もしくは音声入力の値を取得
        };

        //alert(JSON.stringify(JSONdata));
        //alert("検索中・・・")

        $.ajax({
            type : 'post',
            url : url,
            data : JSON.stringify(JSONdata),
            contentType: 'application/json',
            dataType : 'json',
            scriptCharset: 'utf-8',
            success : function(data) {
                // Success
                //alert("success");
                //alert(JSON.stringify(data,null,"\t"));
                //$("#response").html(JSON.stringify(data,null,"\t"));

                //~に関する資料を表示します。
                $("#check").append("「" + $("#text").val() + "」　に関する資料を表示します。");
                // リンクを作成する
                for (var i = 0; i < data.length; i++) {
                    var item = data[i];
                    if (item["資料URL"]) {
                        var url = item["資料URL"] + "#page=" + item["参考ページ"];
                        if(item["参考ページ"]){
                            var page = item["参考ページ"];
                            var link = $('<a>', {
                                text: url,          //表示
                                href: url,          //とび先
                                target: '_blank'    //新規ウィンドウ
                            }); 
                        }

                        // iframeを生成する
                        var iframe = $('<iframe>', {
                            title: "pdfjs-default-viewer",
                            src: url,
                            width: "1200px",
                            height: "1200px"
                        });
                        $("#iframes").append(iframe); // iframeを追加する
                    }
                }
            },
            error : function(data) {

                // Error
                alert("error");
                alert(JSON.stringify(data,null,"\t"));
                JSON.parse(data);
                $("#response").html(JSON.stringify(data,null,"\t"));
            },
            complete: function() {
                $("#loading-screen").hide(); // Ajaxリクエスト完了後にローディング画面を非表示
            }
        });
    });
});
