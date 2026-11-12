import 'dart:async';
import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';
import '../../../../core/theme/app_colors.dart';

class CompactVideoPlayer extends StatefulWidget {
  final String title;
  final String videoUrl;
  final VoidCallback? onNextLesson;
  final VoidCallback? onPrevLesson;

  const CompactVideoPlayer({
    super.key,
    required this.title,
    required this.videoUrl,
    this.onNextLesson,
    this.onPrevLesson,
  });

  @override
  State<CompactVideoPlayer> createState() => _CompactVideoPlayerState();
}

class _CompactVideoPlayerState extends State<CompactVideoPlayer> {
  VideoPlayerController? _controller;
  bool _isInitialized = false;
  bool _hasError = false;
  String _errorMessage = '';
  double _playbackSpeed = 1.0;
  bool _showControls = true;
  Timer? _hideControlsTimer;
  bool _isDragging = false;
  double _dragPositionMs = 0;

  @override
  void initState() {
    super.initState();
    _initController(widget.videoUrl);
  }

  @override
  void didUpdateWidget(CompactVideoPlayer oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.videoUrl != widget.videoUrl) {
      _initController(widget.videoUrl);
    }
  }

  Future<void> _initController(String url) async {
    _hideControlsTimer?.cancel();
    if (_controller != null) {
      _controller!.removeListener(_videoListener);
      await _controller!.pause();
      await _controller!.dispose();
      _controller = null;
    }

    if (url.trim().isEmpty) {
      setState(() {
        _isInitialized = false;
        _hasError = true;
        _errorMessage = 'No video stream URL assigned to this lesson.';
      });
      return;
    }

    setState(() {
      _isInitialized = false;
      _hasError = false;
      _errorMessage = '';
      _showControls = true;
    });

    try {
      final uri = Uri.parse(url.trim());
      final controller = VideoPlayerController.networkUrl(uri);
      _controller = controller;

      await controller.initialize();
      controller.setPlaybackSpeed(_playbackSpeed);
      controller.addListener(_videoListener);

      if (mounted) {
        setState(() {
          _isInitialized = true;
          _hasError = false;
        });
        controller.play();
        _startHideTimer();
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isInitialized = false;
          _hasError = true;
          _errorMessage = 'Could not load stream: $e';
        });
      }
    }
  }

  void _videoListener() {
    if (mounted) {
      setState(() {});
    }
  }

  @override
  void dispose() {
    _hideControlsTimer?.cancel();
    if (_controller != null) {
      _controller!.removeListener(_videoListener);
      _controller!.dispose();
    }
    super.dispose();
  }

  void _startHideTimer() {
    _hideControlsTimer?.cancel();
    _hideControlsTimer = Timer(const Duration(seconds: 4), () {
      if (mounted && (_controller?.value.isPlaying ?? false) && !_isDragging) {
        setState(() => _showControls = false);
      }
    });
  }

  void _toggleControls() {
    setState(() => _showControls = !_showControls);
    if (_showControls) _startHideTimer();
  }

  void _togglePlayPause() {
    if (_controller == null || !_isInitialized) return;
    if (_controller!.value.isPlaying) {
      _controller!.pause();
    } else {
      _controller!.play();
      _startHideTimer();
    }
  }

  void _seekRelative(int seconds) {
    if (_controller == null || !_isInitialized) return;
    final current = _controller!.value.position;
    final target = current + Duration(seconds: seconds);
    final clamped = target < Duration.zero
        ? Duration.zero
        : (target > _controller!.value.duration
            ? _controller!.value.duration
            : target);
    _controller!.seekTo(clamped);
    _startHideTimer();
  }

  void _cycleSpeed() {
    if (_playbackSpeed == 1.0) {
      _playbackSpeed = 1.25;
    } else if (_playbackSpeed == 1.25) {
      _playbackSpeed = 1.5;
    } else if (_playbackSpeed == 1.5) {
      _playbackSpeed = 2.0;
    } else {
      _playbackSpeed = 1.0;
    }
    _controller?.setPlaybackSpeed(_playbackSpeed);
    setState(() {});
    _startHideTimer();
  }

  String _formatDuration(Duration duration) {
    final minutes = duration.inMinutes;
    final seconds = duration.inSeconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final isPlaying = _controller?.value.isPlaying ?? false;
    final isBuffering = _controller?.value.isBuffering ?? false;
    final duration = _controller?.value.duration ?? Duration.zero;
    final position = _controller?.value.position ?? Duration.zero;

    final durationMs = duration.inMilliseconds.toDouble();
    final positionMs = position.inMilliseconds.toDouble().clamp(0.0, durationMs > 0 ? durationMs : 1.0);
    final sliderVal = _isDragging ? _dragPositionMs : positionMs;

    return AspectRatio(
      aspectRatio: 16 / 9,
      child: GestureDetector(
        onTap: _toggleControls,
        child: Container(
          color: Colors.black,
          child: Stack(
            fit: StackFit.expand,
            children: [
              // 1. Video Layer or Fallback
              if (_isInitialized && _controller != null)
                Center(
                  child: AspectRatio(
                    aspectRatio: _controller!.value.aspectRatio,
                    child: VideoPlayer(_controller!),
                  ),
                )
              else if (_hasError)
                Container(
                  color: const Color(0xFF0F172A),
                  padding: const EdgeInsets.all(16),
                  child: Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          Icons.play_disabled_rounded,
                          color: AppColors.gold,
                          size: 32,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          _errorMessage,
                          textAlign: TextAlign.center,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            color: AppColors.textWhite,
                            fontSize: 11,
                          ),
                        ),
                        const SizedBox(height: 10),
                        ElevatedButton.icon(
                          onPressed: () => _initController(widget.videoUrl),
                          icon: const Icon(Icons.refresh_rounded, size: 14),
                          label: const Text('Retry Stream', style: TextStyle(fontSize: 11)),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primaryNavy,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          ),
                        ),
                      ],
                    ),
                  ),
                )
              else
                Container(
                  color: const Color(0xFF0F172A),
                  child: const Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        SizedBox(
                          width: 26,
                          height: 26,
                          child: CircularProgressIndicator(
                            strokeWidth: 2.2,
                            color: AppColors.gold,
                          ),
                        ),
                        SizedBox(height: 8),
                        Text(
                          'Loading Judicial HD Lecture...',
                          style: TextStyle(
                            color: AppColors.textWhite,
                            fontSize: 10.5,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

              // 2. Buffering Indicator overlay
              if (isBuffering && _isInitialized)
                const Center(
                  child: SizedBox(
                    width: 32,
                    height: 32,
                    child: CircularProgressIndicator(
                      strokeWidth: 2.5,
                      color: AppColors.gold,
                    ),
                  ),
                ),

              // 3. Custom Controls Overlay
              AnimatedOpacity(
                opacity: _showControls ? 1.0 : 0.0,
                duration: const Duration(milliseconds: 200),
                child: IgnorePointer(
                  ignoring: !_showControls,
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.black.withValues(alpha: 0.75),
                          Colors.transparent,
                          Colors.black.withValues(alpha: 0.85),
                        ],
                        stops: const [0.0, 0.5, 1.0],
                      ),
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        // Top Bar: Title + Speed Chip
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                widget.title,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  color: AppColors.textWhite,
                                  fontSize: 11.5,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            GestureDetector(
                              onTap: _cycleSpeed,
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 6,
                                  vertical: 2,
                                ),
                                decoration: BoxDecoration(
                                  color: Colors.white.withValues(alpha: 0.2),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  '${_playbackSpeed}x',
                                  style: const TextStyle(
                                    color: AppColors.textWhite,
                                    fontSize: 10,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),

                        // Center Controls: Rewind 10, Play/Pause, Forward 10
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            IconButton(
                              iconSize: 22,
                              padding: EdgeInsets.zero,
                              constraints: const BoxConstraints(),
                              icon: const Icon(
                                Icons.replay_10_rounded,
                                color: AppColors.textWhite,
                              ),
                              onPressed: () => _seekRelative(-10),
                            ),
                            const SizedBox(width: 24),
                            GestureDetector(
                              onTap: _togglePlayPause,
                              child: Container(
                                width: 44,
                                height: 44,
                                decoration: const BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: AppColors.academyIndigo,
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black38,
                                      blurRadius: 4,
                                      offset: Offset(0, 2),
                                    ),
                                  ],
                                ),
                                child: Icon(
                                  isPlaying
                                      ? Icons.pause_rounded
                                      : Icons.play_arrow_rounded,
                                  color: AppColors.textWhite,
                                  size: 26,
                                ),
                              ),
                            ),
                            const SizedBox(width: 24),
                            IconButton(
                              iconSize: 22,
                              padding: EdgeInsets.zero,
                              constraints: const BoxConstraints(),
                              icon: const Icon(
                                Icons.forward_10_rounded,
                                color: AppColors.textWhite,
                              ),
                              onPressed: () => _seekRelative(10),
                            ),
                          ],
                        ),

                        // Bottom Bar: Scrubber + Durations
                        Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            SliderTheme(
                              data: SliderTheme.of(context).copyWith(
                                trackHeight: 2.2,
                                thumbShape: const RoundSliderThumbShape(
                                  enabledThumbRadius: 5.0,
                                ),
                                overlayShape: const RoundSliderOverlayShape(
                                  overlayRadius: 9,
                                ),
                                activeTrackColor: AppColors.gold,
                                inactiveTrackColor: Colors.white.withValues(alpha: 0.3),
                                thumbColor: AppColors.gold,
                              ),
                              child: Slider(
                                value: durationMs > 0 ? sliderVal.clamp(0.0, durationMs) : 0.0,
                                min: 0.0,
                                max: durationMs > 0 ? durationMs : 1.0,
                                onChangeStart: (val) {
                                  _isDragging = true;
                                  _dragPositionMs = val;
                                },
                                onChanged: (val) {
                                  setState(() => _dragPositionMs = val);
                                },
                                onChangeEnd: (val) {
                                  _isDragging = false;
                                  if (_controller != null && _isInitialized) {
                                    _controller!.seekTo(Duration(milliseconds: val.toInt()));
                                  }
                                  _startHideTimer();
                                },
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 6),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    _formatDuration(position),
                                    style: const TextStyle(
                                      color: AppColors.textWhite,
                                      fontSize: 10,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  Text(
                                    _formatDuration(duration),
                                    style: TextStyle(
                                      color: AppColors.textWhite.withValues(alpha: 0.8),
                                      fontSize: 10,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
