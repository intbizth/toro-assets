+function ($) {
    'use strict';

    $('.main-content').on('click', '.custom-tabs a', function(e){
        e.preventDefault();
        $(this).parent().siblings('li').removeClass('active');
        $(this).parent().addClass('active');

        var target = $(this).attr('href');

        $(target).siblings('.tab-pane').removeClass('active');
        $(target).addClass('active');

        var ajax_url;

        if(ajax_url = $(target).data('ajax')) {

            $(target).attr("data-ajax" , '');
            $(target).removeData("ajax");

            if(!$(target).parent().hasClass('ajax-loading')) {
                $(target).parent().addClass('ajax-loading');
            }

            $.ajax({
                url: ajax_url,
                type: 'GET',
                success: function (response) {
                    $(target).html(response);
                    $(target).parent().removeClass('ajax-loading');
                    if($(target + ' #chart-area').length) {
                        build_doughnut_graph(target + ' #chart-area');
                    }

                    $(target).find('[data-widget-name]').each(function(){
                        $.fn.twidget.call($(this));

                    });
                }
            });
        }
    });

    function build_doughnut_graph(target){
        var ctx = $(target).get(0).getContext("2d");
        var stuff;

        stuff = $(target).data('stuff');
        if (typeof stuff === 'undefined') {
            return;
        }

        var doughnut_chart_config = {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [stuff[0], stuff[1]],
                    backgroundColor: [
                        "#133960",
                        "#ffc025"
                    ]
                }],
                labels: [

                ]
            },
            options: {
                responsive: true,
                tooltips: false,
                animation: {
                    animateScale: true,
                    animateRotate: false
                }
            }
        };
        window.myDoughnut = new Chart(ctx, doughnut_chart_config);
    }

    $( document ).ajaxSuccess(function( event, xhr, settings ) {
        if ( settings.url.match(/wg_match_stats/g) && $('.match-stats__graph #chart-area').length) {
            build_doughnut_graph('.match-stats__graph #chart-area');
        }
    });

    $('.club-filter').each(function(e){
        var _this = $(this);
        var mapping = _this.data('mapping');
        var competition = _this.closest('.schedule').find('.competition-filter').first();
        competition.find('option:not(:first)').hide();

        for(var i in mapping[_this.val()]){
            competition.find('option[value="'+ mapping[_this.val()][i] +'"]').show();
        }
    });

    $('.club-filter').on('change', function(e){
        var _this = $(this);
        var mapping = _this.data('mapping');
        var competition = _this.closest('.schedule').find('.competition-filter').first();
        competition.find('option:not(:first)').hide();

        if(_this.val()) {
            for (var i in mapping[_this.val()]) {
                competition.find('option[value="' + mapping[_this.val()][i] + '"]').show();
            }
        }

        if(!_this.val()){
            competition.val('');
        }
        else{
            competition.val(mapping[_this.val()][0]);
        }

        //Set value to the first one

        competition.trigger('change');



    });
    $('.competition-filter').on('change', function(e){
        var _this = $(this);

        var club = _this.closest('.schedule').find('.club-filter').first();

        if(!_this.val() && club.val()){
            return;
        }

        var data = {
            competition_code: $(this).val()
        };

        var url = _this.data('url');

        if(!_this.val()) {
            data = {
                only_national: 1
            };
            url = _this.data('url-national');
        }

        if(!_this.closest('.schedule').hasClass('ajax-loading')) {
            _this.closest('.schedule').addClass('ajax-loading');
        }

        $.ajax({
            url: url,
            type: 'GET',
            data: data,
            error: function (response) {
                console.log(response);
            },
            success: function (response) {
                _this.closest('.schedule').removeClass('ajax-loading');
                _this.closest('.schedule').find('.match-round-result').html(response);

                if(_this.val()) {
                    _this.closest('.schedule').find('.schedule__main-filter li.active a').click();
                }else {
                    _this.closest('.schedule').find('.schedule__main-filter a[href="#tab-schedule"]').click();
                }
            }
        });
    });
    $('.match-round-result').on('click', 'a.filter-button.round,a.filter-button.week', function(e){
        var _this = $(this);
        var competition_element = _this.closest('.schedule').find('.competition-filter').first();
        var data = _this.hasClass('week') ?
        {
            competition_code: competition_element.val(),
            week: _this.data('week')
        } :
        {
            competition_code: competition_element.val(),
            round_code: _this.data('round')
        };

        e.preventDefault();
        $.ajax({
            url: competition_element.data('url'),
            type: 'GET',
            data: data,
            error: function (response) {
                console.log(response);
            },
            success: function (response) {
                _this.closest('.schedule').find('.match-round-result').html(response);
                _this.closest('.schedule').find('.schedule__main-filter li.active a').click();
            }
        });
    });
}(jQuery);
