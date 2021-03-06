// Generated by CoffeeScript 1.3.3
(function() {
  var TTF, canvas, ctx, drawGlyph, drawOutline, drawTriangles, loadBuffer, stats, svgTessellate, triangulate;

  loadBuffer = function(_arg) {
    var error, load, path, progress, request;
    path = _arg.path, load = _arg.load, progress = _arg.progress, error = _arg.error;
    request = new XMLHttpRequest();
    request.open('GET', path, true);
    request.responseType = 'arraybuffer';
    request.onload = function(a, b, c) {
      var _ref;
      if ((_ref = request.status) === 200 || _ref === 304) {
        if (load) {
          return load(request.response);
        }
      } else {
        return error(request.statusText);
      }
    };
    request.onprogress = function(event) {
      if (progress && event.lengthComputable) {
        return progress(event.loaded / event.total);
      }
    };
    return request.send();
  };

  TTF = require('font');

  svgTessellate = require('svg-tessellate');

  triangulate = require('triangulate');

  ctx = null;

  canvas = null;

  stats = null;

  drawOutline = function(glyph, contours) {
    var contour, extend, line, scale, _i, _j, _len, _len1;
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.strokeStyle = 'red';
    extend = Math.max(glyph.width, glyph.height);
    scale = 500 / extend;
    ctx.scale(1, -1);
    ctx.translate(-glyph.centerX * scale, -glyph.centerY * scale);
    for (_i = 0, _len = contours.length; _i < _len; _i++) {
      contour = contours[_i];
      for (_j = 0, _len1 = contour.length; _j < _len1; _j++) {
        line = contour[_j];
        ctx.beginPath();
        ctx.moveTo(line.from.x * scale, line.from.y * scale);
        ctx.lineTo(line.to.x * scale, line.to.y * scale);
        ctx.stroke();
      }
    }
    return ctx.restore();
  };

  drawTriangles = function(glyph, contours) {
    var end, extend, i, p1, p2, p3, scale, start, triangles, _i, _ref;
    start = performance.now();
    triangles = triangulate(glyph, contours);
    end = performance.now();
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.strokeStyle = 'black';
    ctx.fillStyle = 'green';
    extend = Math.max(glyph.width, glyph.height);
    scale = 500 / extend;
    ctx.scale(1, -1);
    ctx.translate(-glyph.centerX * scale, -glyph.centerY * scale);
    for (i = _i = 0, _ref = triangles.length; _i < _ref; i = _i += 3) {
      p1 = triangles[i + 0];
      p2 = triangles[i + 1];
      p3 = triangles[i + 2];
      console.log(p1, p2, p3);
      ctx.beginPath();
      ctx.moveTo(p1.x * scale, p1.y * scale);
      ctx.lineTo(p2.x * scale, p2.y * scale);
      ctx.lineTo(p3.x * scale, p3.y * scale);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(p1.x * scale, p1.y * scale);
      ctx.lineTo(p2.x * scale, p2.y * scale);
      ctx.lineTo(p3.x * scale, p3.y * scale);
      ctx.closePath();
      ctx.stroke();
    }
    ctx.restore();
    $('<label>Triangulate: </label>').appendTo(stats);
    return $('<span></span>').text((end - start).toFixed(4) + 'ms').appendTo(stats);
  };

  drawGlyph = function(glyph, bezier) {
    var contour, contours, end, start;
    if (bezier == null) {
      bezier = false;
    }
    stats.empty();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    start = performance.now();
    contours = (function() {
      var _i, _len, _ref, _results;
      _ref = glyph.contours;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        contour = _ref[_i];
        if (bezier) {
          _results.push(svgTessellate(contour));
        } else {
          _results.push(contour);
        }
      }
      return _results;
    })();
    end = performance.now();
    $('<label>Bezier Tessellate: </label>').appendTo(stats);
    $('<span></span>').text((end - start).toFixed(4) + 'ms, ').appendTo(stats);
    drawTriangles(glyph, contours);
    return drawOutline(glyph, contours);
  };

  $(function() {
    var bezierCheckbox, controls, font, go, select;
    canvas = $('canvas')[0];
    ctx = canvas.getContext('2d');
    font = null;
    controls = $('<div></div>').insertBefore(canvas);
    $('<label>Glyph: </label>').appendTo(controls);
    select = $('<select></select>').appendTo(controls);
    $('<label>Bezier: </label>').appendTo(controls);
    bezierCheckbox = $('<input type="checkbox" checked="checked"></input>').appendTo(controls);
    go = $('<button>Go</button>').appendTo(controls).click(function() {
      var doBezier, glyph, glyphNum;
      glyphNum = parseInt(select.val(), 10);
      doBezier = bezierCheckbox[0].checked;
      glyph = font.tables.glyf.glyphs[glyphNum];
      return drawGlyph(glyph, doBezier);
    });
    stats = $('<div></div>').insertAfter(controls);
    return loadBuffer({
      path: 'fonts/leaguegothic-regular-webfont.ttf',
      load: function(buffer) {
        var glyph, i, _i, _len, _ref, _results;
        font = new TTF(buffer);
        _ref = font.tables.glyf.glyphs;
        _results = [];
        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
          glyph = _ref[i];
          _results.push($('<option></option>').text(i).val(i).appendTo(select));
        }
        return _results;
      }
    });
  });

}).call(this);
