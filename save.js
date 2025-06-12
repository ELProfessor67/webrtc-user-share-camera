"use client"
import { useState, useRef, use, useEffect, useCallback } from "react"
import { Camera, Trash2, ImageIcon, Plus, Maximize2, VideoIcon, PlayIcon, Save, Edit, Minimize2, Expand, ZoomIn, ZoomOut, Pencil, X, Play } from "lucide-react"
import useWebRTC from "@/hooks/useWebRTC"
import useDrawingTools from "@/hooks/useDrawingTools"
import { createRequest, getMeetingByMeetingId, deleteRecordingRequest, deleteScreenshotRequest } from "@/http/meetingHttp"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDialog } from "@/provider/DilogsProvider"
import { Button } from "@/components/ui/button"
import { logoutRequest } from "@/http/authHttp"
import { useUser } from "@/provider/UserProvider"

export default function Page({ params }) {
  const { id } = use(params);
  const router = useRouter();

  // Add hydration state at the top
  const [isClient, setIsClient] = useState(false);

  const [targetTime, setTargetTime] = useState("Emergency 24 Hours")
  const [showDropdown, setShowDropdown] = useState(false)
  const [residentName, setResidentName] = useState("")
  const [residentAddress, setResidentAddress] = useState("")
  const [postCode, setPostCode] = useState("")
  const [repairDetails, setRepairDetails] = useState("")
  const [callDuration, setCallDuration] = useState(0);

  // Add state for existing meeting data
  const [existingMeetingData, setExistingMeetingData] = useState(null);
  const [isLoadingMeetingData, setIsLoadingMeetingData] = useState(true);
  const [existingScreenshots, setExistingScreenshots] = useState([]); // Add state for existing screenshots

  // Add missing maximized item state
  const [maximizedItem, setMaximizedItem] = useState(null);

  // Add loading states for save operations
  const [isSaving, setIsSaving] = useState(false);
  const [isEndingSave, setIsEndingSave] = useState(false);
  const [savingRecordingId, setSavingRecordingId] = useState(null);
  const [savingScreenshotIndex, setSavingScreenshotIndex] = useState(null);

  // NEW: Add save protection state and refs
  const [saveInProgress, setSaveInProgress] = useState(false);
  const saveTimeoutRef = useRef(null);
  const processedItemsRef = useRef(new Set());

  // Screen recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState([]);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordingStream, setRecordingStream] = useState(null);
  const [playingVideos, setPlayingVideos] = useState(new Set());
  const [recordingStartTime, setRecordingStartTime] = useState(null);
  const [currentRecordingDuration, setCurrentRecordingDuration] = useState(0);

  // Add state for tracking video progress - MOVED HERE FROM BOTTOM
  const [videoProgress, setVideoProgress] = useState({});

  // Pencil tool states - updated to use drawing hook
  const [activePencilScreenshot, setActivePencilScreenshot] = useState(null);
  const [showPencilDropdown, setShowPencilDropdown] = useState(null);

  // Add state for token-specific landlord info 
  const [tokenLandlordInfo, setTokenLandlordInfo] = useState(null);
  const [isLoadingTokenInfo, setIsLoadingTokenInfo] = useState(true);

  // Initialize drawing tools hook
  const {
    colors,
    tools,
    selectedColor,
    setSelectedColor,
    selectedTool,
    setSelectedTool,
    lineWidth,
    setLineWidth,
    initializeCanvas,
    startDrawing,
    draw,
    stopDrawing,
    clearCanvas: clearDrawingCanvas,
    mergeWithBackground,
    drawingData
  } = useDrawingTools();

  const videoRef = useRef(null);
  const startTimeRef = useRef(null);
  const timerRef = useRef(null);
  const recordingChunks = useRef([]);
  const recordingTimerRef = useRef(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [videoPanX, setVideoPanX] = useState(0);
  const [videoPanY, setVideoPanY] = useState(0);

  const { handleDisconnect, isConnected, screenshots, takeScreenshot, startPeerConnection, deleteScreenshot, handleVideoPlay, showVideoPlayError } = useWebRTC(true, id, videoRef);
  const { setResetOpen, setMessageOpen, setLandlordDialogOpen, setTickerOpen, setFeedbackOpen, setFaqOpen } = useDialog();
  const { user, isAuth, setIsAuth, setUser } = useUser();

  // Helper function to convert blob to base64
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // NEW: Debounced save function
  const debouncedSave = useCallback((saveFunction) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      if (!saveInProgress) {
        saveFunction();
      }
    }, 300); // 300ms debounce
  }, [saveInProgress]);

  // NEW: Check if save should be disabled
  const isSaveDisabled = useCallback(() => {
    return (
      (!isConnected && recordings.length === 0 && screenshots.length === 0) ||
      isSaving ||
      isEndingSave ||
      saveInProgress
    );
  }, [isConnected, recordings.length, screenshots.length, isSaving, isEndingSave, saveInProgress]);

  // NEW: Extract common save logic
  const performSave = useCallback(async (options = {}) => {
    const { disconnectVideo = false } = options;

    console.log('💾 Starting save process...');

    // Separate new recordings from existing ones
    const newRecordings = recordings.filter(recording => !recording.isExisting && recording.blob);
    const existingRecordings = recordings.filter(recording => recording.isExisting);

    // Process recordings with duplicate prevention
    const recordingsData = [];
    const processedRecordings = new Set();

    for (let i = 0; i < newRecordings.length; i++) {
      const recording = newRecordings[i];
      const recordingKey = `${recording.id}-${recording.timestamp}`;

      if (processedRecordings.has(recordingKey)) {
        console.log('⚠️ Skipping duplicate recording:', recordingKey);
        continue;
      }

      processedRecordings.add(recordingKey);

      try {
        const base64Data = await blobToBase64(recording.blob);
        recordingsData.push({
          data: base64Data,
          timestamp: recording.timestamp,
          duration: recording.duration || Math.floor((recording.blob.size / 1000) / 16),
          size: recording.blob.size
        });
        console.log(`✅ NEW recording ${i + 1} processed successfully`);
      } catch (error) {
        console.error(`❌ Error processing NEW recording ${i + 1}:`, error);
      }
    }

    // Process screenshots with duplicate prevention
    const screenshotsData = [];
    const processedScreenshots = new Set();

    for (let i = 0; i < screenshots.length; i++) {
      const screenshot = screenshots[i];
      const screenshotKey = `screenshot-${i}-${screenshot.substring(0, 50)}`;

      if (processedScreenshots.has(screenshotKey)) {
        console.log('⚠️ Skipping duplicate screenshot:', screenshotKey);
        continue;
      }

      processedScreenshots.add(screenshotKey);

      try {
        let finalScreenshotData = screenshot;
        const canvasId = `new-${i}`;

        if (drawingData[canvasId]) {
          console.log(`🎨 Merging drawings for screenshot ${i + 1}...`);
          finalScreenshotData = await mergeWithBackground(screenshot, canvasId);
          console.log(`✅ Drawing merge completed for screenshot ${i + 1}`);
        }

        screenshotsData.push({
          data: finalScreenshotData,
          timestamp: new Date().toISOString(),
          size: finalScreenshotData.length
        });
        console.log(`✅ NEW screenshot ${i + 1} processed successfully`);
      } catch (error) {
        console.error(`❌ Error processing screenshot ${i + 1}:`, error);
        screenshotsData.push({
          data: screenshot,
          timestamp: new Date().toISOString(),
          size: screenshot.length
        });
      }
    }

    const formData = {
      meeting_id: id,
      name: residentName,
      address: residentAddress,
      post_code: postCode,
      repair_detail: repairDetails,
      target_time: targetTime,
      recordings: recordingsData,
      screenshots: screenshotsData,
      update_mode: existingMeetingData ? 'update' : 'create'
    };

    console.log('📤 Sending data to server...');
    console.log('📋 Form data summary:', {
      meeting_id: id,
      update_mode: formData.update_mode,
      new_recordings_count: recordingsData.length,
      new_screenshots_count: screenshotsData.length,
      existing_recordings_count: existingRecordings.length,
      total_recordings_after_save: existingRecordings.length + recordingsData.length
    });

    const response = await createRequest(formData);
    console.log('✅ Save successful!');

    // Reset pencil mode and clear all drawing data
    setActivePencilScreenshot(null);

    // Update recordings state to mark all recordings as existing/saved - ATOMIC UPDATE
    setRecordings(prev => prev.map(rec => ({
      ...rec,
      isExisting: true
    })));

    // Move all new screenshots to existing screenshots and mark them as saved - ATOMIC UPDATE
    if (screenshotsData.length > 0) {
      const newSavedScreenshots = screenshotsData.map((screenshot, index) => ({
        id: `saved-${Date.now()}-${index}-${Math.random()}`, // Add random to ensure uniqueness
        url: screenshot.data,
        timestamp: new Date(screenshot.timestamp).toLocaleString(),
        isExisting: true
      }));

      setExistingScreenshots(prev => {
        // Filter out any potential duplicates based on URL
        const existingUrls = new Set(prev.map(s => s.url));
        const uniqueNewScreenshots = newSavedScreenshots.filter(s => !existingUrls.has(s.url));

        if (uniqueNewScreenshots.length !== newSavedScreenshots.length) {
          console.log('⚠️ Filtered out duplicate screenshots');
        }

        return [...prev, ...uniqueNewScreenshots];
      });

      // Clear all screenshots from useWebRTC after saving
      const screenshotCount = screenshots.length;
      for (let i = screenshotCount - 1; i >= 0; i--) {
        deleteScreenshot(i);
      }
      console.log(`🧹 Cleared ${screenshotCount} screenshots from new screenshots array`);
    }

    // Update existing meeting data reference
    if (!existingMeetingData) {
      setExistingMeetingData({
        meeting_id: id,
        name: residentName,
        address: residentAddress,
        post_code: postCode,
        repair_detail: repairDetails,
        target_time: targetTime
      });
    }

    return { recordingsData, screenshotsData };
  }, [
    recordings, screenshots, drawingData, mergeWithBackground, deleteScreenshot,
    id, residentName, residentAddress, postCode, repairDetails, targetTime, existingMeetingData
  ]);

  const handleZoomIn = () => {
    setZoomLevel(prev => {
      const newZoom = Math.min(prev + 0.25, 3); // Max zoom 3x
      console.log('Zooming in to:', newZoom);
      return newZoom;
    });
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => {
      const newZoom = Math.max(prev - 0.25, 0.5); // Min zoom 0.5x
      console.log('Zooming out to:', newZoom);

      // Reset pan when zooming out to 1x
      if (newZoom <= 1) {
        setVideoPanX(0);
        setVideoPanY(0);
      }

      return newZoom;
    });
  };

  const handleZoomReset = () => {
    setZoomLevel(1);
    setVideoPanX(0);
    setVideoPanY(0);
    console.log('Zoom reset to 1x');
  };

  // Add pan functionality for when zoomed in
  const handleVideoPan = (e) => {
    if (zoomLevel <= 1) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate pan offset based on mouse position
    const panX = (centerX - mouseX) * 0.5;
    const panY = (centerY - mouseY) * 0.5;

    setVideoPanX(panX);
    setVideoPanY(panY);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle zoom shortcuts when not in input fields
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '=':
          case '+':
            e.preventDefault();
            handleZoomIn();
            break;
          case '-':
            e.preventDefault();
            handleZoomOut();
            break;
          case '0':
            e.preventDefault();
            handleZoomReset();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Optional: Reset zoom when video connection changes
  useEffect(() => {
    if (!isConnected) {
      setZoomLevel(1);
      setVideoPanX(0);
      setVideoPanY(0);
    }
  }, [isConnected]);

  // UPDATED: Add new function to handle "End Video and Save Images" with better protection
  const handleEndVideoAndSave = async (e) => {
    // Prevent form submission and page refresh
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      // Check if stopImmediatePropagation exists before calling it
      if (typeof e.stopImmediatePropagation === 'function') {
        e.stopImmediatePropagation();
      }
    }

    // Check if already in progress
    if (isEndingSave || isSaving || saveInProgress) {
      console.log('⚠️ End video save already in progress');
      return;
    }

    try {
      setSaveInProgress(true);
      setIsEndingSave(true);
      console.log('🎬 Starting End Video and Save process...');

      // First disconnect the video call
      if (isConnected) {
        handleDisconnect();
      }

      // Stop any ongoing recording
      if (isRecording) {
        stopScreenRecording();
      }

      // Wait a moment for any final recording to process
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Use shared save logic
      const result = await performSave({ disconnectVideo: true });

      toast.success("Video ended and all content saved successfully!");

    } catch (error) {
      console.error('❌ End Video and Save failed:', error);
      toast.error("Failed to end video and save content", {
        description: error?.response?.data?.message || error.message
      });
    } finally {
      setIsEndingSave(false);
      setSaveInProgress(false);
    }
  };

  // UPDATED: handleSave with better protection and shared logic
  const handleSave = async (e) => {
    // Prevent form submission and page refresh
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      // Check if stopImmediatePropagation exists before calling it
      if (typeof e.stopImmediatePropagation === 'function') {
        e.stopImmediatePropagation();
      }
    }

    // Check if already in progress
    if (isSaving || isEndingSave || saveInProgress) {
      console.log('⚠️ Save already in progress');
      return;
    }

    try {
      setSaveInProgress(true);
      setIsSaving(true);

      // Use shared save logic
      const result = await performSave();

      toast.success("Repair saved successfully!", {
        description: `Added ${result.recordingsData.length} new recordings and ${result.screenshotsData.length} new screenshots.`
      });

    } catch (error) {
      console.error('❌ Save failed:', error);
      toast.error("Failed to save repair", {
        description: error?.response?.data?.message || error.message
      });
    } finally {
      setIsSaving(false);
      setSaveInProgress(false);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await logoutRequest();

      // Additional cleanup - clear any localStorage/sessionStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.clear();

      // Clear cookies from frontend side as well
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure; samesite=none";

      toast("Logout Successful", {
        description: res.data.message
      });

      setIsAuth(false);
      setUser(null);
      router.push('../');
    } catch (error) {
      // Even if logout API fails, clear local state
      setIsAuth(false);
      setUser(null);
      localStorage.clear();

      toast("Logout Unsuccessful", {
        description: error?.response?.data?.message || error.message
      });

      router.push('../');
    }
  }

  // Add dashboard handler
  const handleDashboard = () => {
    router.push("../../../dashboard/");
  }

  // Simple timer effect that doesn't interfere with WebRTC - with localStorage persistence
  useEffect(() => {
    if (!isClient) return;

    // Load saved timer data from localStorage on component mount
    const savedStartTime = localStorage.getItem(`call-start-time-${id}`);
    const savedDuration = localStorage.getItem(`call-duration-${id}`);

    if (isConnected && !startTimeRef.current) {
      // If there's saved data and we're reconnecting, restore it
      if (savedStartTime) {
        const savedTime = parseInt(savedStartTime);
        const elapsedSinceStart = Math.floor((Date.now() - savedTime) / 1000);
        startTimeRef.current = savedTime;
        setCallDuration(elapsedSinceStart);
        console.log('Restored call timer from localStorage:', elapsedSinceStart);
      } else {
        // New call - save start time
        const startTime = Date.now();
        startTimeRef.current = startTime;
        localStorage.setItem(`call-start-time-${id}`, startTime.toString());
        console.log('Started new call timer');
      }

      timerRef.current = setInterval(() => {
        const currentDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setCallDuration(currentDuration);
        // Save current duration to localStorage
        localStorage.setItem(`call-duration-${id}`, currentDuration.toString());
      }, 1000);
    }

    if (!isConnected && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      startTimeRef.current = null;
      setCallDuration(0);
      // Clear localStorage when call ends
      localStorage.removeItem(`call-start-time-${id}`);
      localStorage.removeItem(`call-duration-${id}`);
      console.log('Call ended, cleared timer from localStorage');
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isConnected, id, isClient]);

  // Load saved duration on component mount (for page refresh scenarios)
  useEffect(() => {
    if (!isClient) return;

    const savedDuration = localStorage.getItem(`call-duration-${id}`);
    const savedStartTime = localStorage.getItem(`call-start-time-${id}`);

    if (savedDuration && savedStartTime && !isConnected) {
      // If we have saved data but not connected, show the last known duration
      const duration = parseInt(savedDuration);
      setCallDuration(duration);
      console.log('Loaded call duration from localStorage on mount:', duration);
    }
  }, [id, isClient]);

  // Format time to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Format recording duration
  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Recording timer effect
  useEffect(() => {
    if (isRecording && recordingStartTime) {
      recordingTimerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
        setCurrentRecordingDuration(elapsed);
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      setCurrentRecordingDuration(0);
    }

    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [isRecording, recordingStartTime]);

  // Screen recording functions
  const startScreenRecording = async () => {
    try {
      // Get video stream from the video element instead of screen
      if (!videoRef.current || !videoRef.current.srcObject) {
        toast('No video stream available to record');
        return;
      }

      // Set recording start time
      const startTime = Date.now();
      setRecordingStartTime(startTime);

      // Hide video controls during recording
      if (videoRef.current) {
        videoRef.current.controls = false;
        videoRef.current.style.pointerEvents = 'none';
      }

      const stream = videoRef.current.srcObject;

      setRecordingStream(stream);

      // Create MediaRecorder with higher quality settings
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 5000000, // Increased to 5 Mbps for higher quality
        audioBitsPerSecond: 128000   // Add audio bitrate for better audio quality
      });

      // Reset chunks
      recordingChunks.current = [];

      // Handle data available event - record in smaller chunks for better quality
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordingChunks.current.push(event.data);
        }
      };

      // Handle recording stop event
      recorder.onstop = () => {
        // Calculate final duration
        const endTime = Date.now();
        const duration = Math.floor((endTime - startTime) / 1000);

        // Restore video controls after recording
        if (videoRef.current) {
          videoRef.current.style.pointerEvents = 'auto';
        }

        const blob = new Blob(recordingChunks.current, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(blob);

        const newRecording = {
          id: Date.now(),
          url: videoUrl,
          blob: blob,
          timestamp: new Date().toLocaleString(),
          duration: duration
        };

        setRecordings(prev => [...prev, newRecording]);
        setIsRecording(false);
        setRecordingStartTime(null);
      };

      setMediaRecorder(recorder);
      // Start recording with timeslice for better quality chunks
      recorder.start(1000); // Record in 1 second chunks
      setIsRecording(true);
      toast('Video recording started');

    } catch (error) {
      console.error('Error starting video recording:', error);
      // Fallback to webm if vp9 not supported
      try {
        const stream = videoRef.current.srcObject;
        const startTime = Date.now();
        setRecordingStartTime(startTime);

        const recorder = new MediaRecorder(stream, {
          mimeType: 'video/webm',
          videoBitsPerSecond: 3000000, // Higher fallback quality
          audioBitsPerSecond: 128000
        });

        // Hide controls
        if (videoRef.current) {
          videoRef.current.controls = false;
          videoRef.current.style.pointerEvents = 'none';
        }

        // Reset chunks
        recordingChunks.current = [];

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordingChunks.current.push(event.data);
          }
        };

        recorder.onstop = () => {
          const endTime = Date.now();
          const duration = Math.floor((endTime - startTime) / 1000);

          if (videoRef.current) {
            videoRef.current.style.pointerEvents = 'auto';
          }

          const blob = new Blob(recordingChunks.current, { type: 'video/webm' });
          const videoUrl = URL.createObjectURL(blob);

          const newRecording = {
            id: Date.now(),
            url: videoUrl,
            blob: blob,
            timestamp: new Date().toLocaleString(),
            duration: duration
          };

          setRecordings(prev => [...prev, newRecording]);
          setIsRecording(false);
          setRecordingStartTime(null);
        };

        setMediaRecorder(recorder);
        recorder.start(1000);
        setIsRecording(true);
        toast('High quality video recording started');
      } catch (fallbackError) {
        toast('Failed to start video recording');
        setRecordingStartTime(null);
      }
    }
  };

  const stopScreenRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      // Restore video controls
      if (videoRef.current) {
        videoRef.current.style.pointerEvents = 'auto';
      }
      toast('Recording stopped');
    }
  };

  const handleRecordingToggle = () => {
    if (isRecording) {
      stopScreenRecording();
    } else {
      startScreenRecording();
    }
  };

  // Updated delete recording function
  const deleteRecording = async (recording) => {
    try {
      if (recording.isExisting) {
        // Send delete request to backend for existing recordings
        console.log(`🗑️ Deleting existing recording ${recording.id} from meeting ${id}`);

        try {
          const response = await deleteRecordingRequest(id, recording.id);

          if (response.data.timeout) {
            toast.success("Recording deletion requested (processing in background)");
          } else {
            toast.success("Recording deleted successfully!");
          }
        } catch (error) {
          console.error('Error during API delete call:', error);
          // Even if API call fails, remove from UI for better user experience
          toast.info("Recording removed from view but backend deletion failed");
        }
      } else {
        // Local deletion for new recordings (not yet saved)
        console.log(`🗑️ Deleting local recording ${recording.id}`);
      }

      // Always remove from state regardless of API success
      setRecordings(prev => {
        const recordingToDelete = prev.find(r => r.id === recording.id);
        if (recordingToDelete && recordingToDelete.url) {
          URL.revokeObjectURL(recordingToDelete.url);
        }
        return prev.filter(r => r.id !== recording.id);
      });

      if (!recording.isExisting) {
        toast.success("Recording removed!");
      }
    } catch (error) {
      console.error('❌ Delete recording failed:', error);
      toast.error("Failed to delete recording", {
        description: error?.response?.data?.message || error.message
      });
    }
  };

  // Delete existing screenshot function
  const deleteExistingScreenshot = async (screenshot) => {
    try {
      console.log(`🗑️ Deleting existing screenshot ${screenshot.id} from meeting ${id}`);
      const response = await deleteScreenshotRequest(id, screenshot.id);

      if (response.data.timeout) {
        toast.success("Screenshot deletion requested (processing in background)");
      } else {
        toast.success("Screenshot deleted successfully!");
      }

      // Remove from existing screenshots state immediately
      setExistingScreenshots(prev => prev.filter(s => s.id !== screenshot.id));
    } catch (error) {
      console.error('❌ Delete screenshot failed:', error);
      toast.error("Failed to delete screenshot", {
        description: error?.response?.data?.message || error.message
      });
    }
  };

  // Local screenshot delete function (for new screenshots from useWebRTC)
  const deleteNewScreenshot = (screenshotIndex) => {
    try {
      // Use the deleteScreenshot function from useWebRTC hook
      deleteScreenshot(screenshotIndex);
      toast.success("Screenshot removed!");
    } catch (error) {
      console.error('Error deleting screenshot:', error);
      toast.error("Failed to delete screenshot");
    }
  };

  // Pencil tool functions - Memoize to prevent re-renders
  // Fixed Pencil tool functions
  const handlePencilClick = useCallback((canvasId, screenshot, index) => {
    console.log('🖋️ handlePencilClick called with:', canvasId, index);

    // Maximize the screenshot with drawing mode enabled
    setMaximizedItem({
      type: 'screenshot',
      id: canvasId,
      data: screenshot,
      index: index,
      isExisting: false,
      drawingMode: true // Enable drawing mode immediately
    });

    // Set drawing state
    setActivePencilScreenshot(canvasId);

    console.log('✅ Screenshot maximized with drawing mode enabled');
  }, []);
  // Add effect to close dropdown when clicking outside (updated)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (maximizedItem &&
        !event.target.closest('.drawing-tools-panel') &&
        !event.target.closest('canvas')) {
        // Only close if clicking outside the modal content
        const modalContent = event.target.closest('.fixed.inset-0');
        if (!modalContent) {
          closeMaximized();
        }
      }
    };

    if (maximizedItem) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [maximizedItem]);

  const handleColorSelect = useCallback((color) => {
    setSelectedColor(color);

    // Immediate visual feedback - update any active canvas context
    if (contextRef?.current) {
      contextRef.current.strokeStyle = color;
    }

    console.log('Color changed to:', color); // Debug log
  }, [setSelectedColor]);

  const handleToolSelect = useCallback((tool) => {
    setSelectedTool(tool);
    console.log('Tool changed to:', tool); // Debug log
  }, [setSelectedTool]);

  // Add effect to close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showPencilDropdown &&
        !event.target.closest('.pencil-dropdown-container')) {
        setShowPencilDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPencilDropdown]);

  // Add effect to fetch existing meeting data when component mounts
  useEffect(() => {
    if (!isClient || !id) return;

    const fetchExistingMeetingData = async () => {
      setIsLoadingMeetingData(true);
      try {
        console.log('🔍 Fetching existing meeting data for ID:', id);
        const response = await getMeetingByMeetingId(id);

        if (response.data.success && response.data.meeting) {
          const meetingData = response.data.meeting;
          console.log('✅ Found existing meeting data:', meetingData);

          // Pre-populate form fields with existing data
          setResidentName(meetingData.name || "");
          setResidentAddress(meetingData.address || "");
          setPostCode(meetingData.post_code || "");
          setRepairDetails(meetingData.repair_detail || "");
          setTargetTime(meetingData.target_time || "Emergency 24 Hours");

          // Store existing recordings
          if (meetingData.recordings && meetingData.recordings.length > 0) {
            const existingRecordings = meetingData.recordings.map(rec => ({
              id: rec._id || Date.now() + Math.random(),
              url: rec.url,
              blob: null,
              timestamp: new Date(rec.timestamp).toLocaleString(),
              duration: rec.duration || 0,
              isExisting: true
            }));
            setRecordings(existingRecordings);
          }

          // Store existing screenshots
          if (meetingData.screenshots && meetingData.screenshots.length > 0) {
            const existingScreenshotsData = meetingData.screenshots.map(screenshot => ({
              id: screenshot._id || Date.now() + Math.random(),
              url: screenshot.url,
              timestamp: new Date(screenshot.timestamp).toLocaleString(),
              isExisting: true
            }));
            setExistingScreenshots(existingScreenshotsData);
            console.log('📸 Loaded existing screenshots:', existingScreenshotsData.length);
          }

          setExistingMeetingData(meetingData);

          toast.success("Meeting data loaded successfully!", {
            description: `Found ${meetingData.recordings?.length || 0} recordings and ${meetingData.screenshots?.length || 0} screenshots`
          });
        }
      } catch (error) {
        // Handle different types of errors gracefully
        if (error.code === 'ERR_NETWORK') {
          console.log('ℹ️ Cannot connect to server - this is normal if server is starting up');
        } else if (error?.response?.status === 404) {
          console.log('ℹ️ No existing meeting data found for ID:', id, '(This is normal for new meetings)');
        } else if (error?.response?.status === 500) {
          console.log('ℹ️ Server error while fetching meeting data - this may be temporary');
        } else if (error.code === 'ECONNABORTED') {
          console.log('ℹ️ Request timeout while fetching meeting data');
        } else {
          console.log('ℹ️ Error fetching meeting data:', error.message);
        }
      } finally {
        setIsLoadingMeetingData(false);
      }
    };

    fetchExistingMeetingData();
  }, [id, isClient]);

  // UPDATED: Add individual save functions with better duplicate protection
  const saveIndividualRecording = useCallback(async (recording) => {
    if (recording.isExisting) {
      toast.info("Recording already saved");
      return;
    }

    const itemKey = `recording-${recording.id}`;

    // Prevent duplicate processing
    if (processedItemsRef.current.has(itemKey)) {
      console.log('⚠️ Recording already being processed:', itemKey);
      return;
    }

    processedItemsRef.current.add(itemKey);

    try {
      setSavingRecordingId(recording.id);
      console.log('💾 Saving individual recording...');

      const base64Data = await blobToBase64(recording.blob);
      const recordingsData = [{
        data: base64Data,
        timestamp: recording.timestamp,
        duration: recording.duration,
        size: recording.blob.size
      }];

      const formData = {
        meeting_id: id,
        name: residentName,
        address: residentAddress,
        post_code: postCode,
        repair_detail: repairDetails,
        target_time: targetTime,
        recordings: recordingsData,
        screenshots: [],
        update_mode: existingMeetingData ? 'update' : 'create'
      };

      const response = await createRequest(formData);

      // Update the recording to mark it as existing - ATOMIC UPDATE
      setRecordings(prev => prev.map(r =>
        r.id === recording.id
          ? { ...r, isExisting: true }
          : r
      ));

      toast.success("Recording saved successfully!");

    } catch (error) {
      console.error('❌ Save recording failed:', error);
      toast.error("Failed to save recording");
    } finally {
      setSavingRecordingId(null);
      processedItemsRef.current.delete(itemKey);
    }
  }, [id, residentName, residentAddress, postCode, repairDetails, targetTime, existingMeetingData]);

  const saveIndividualScreenshot = useCallback(async (screenshotData, index) => {
    const itemKey = `screenshot-${index}`;

    // Prevent duplicate processing
    if (processedItemsRef.current.has(itemKey)) {
      console.log('⚠️ Screenshot already being processed:', itemKey);
      return;
    }

    processedItemsRef.current.add(itemKey);

    try {
      setSavingScreenshotIndex(index);
      console.log('💾 Saving individual screenshot...');

      let finalScreenshotData = screenshotData;
      const canvasId = `new-${index}`;

      // Check if this screenshot has drawings and merge them at full resolution
      if (drawingData[canvasId]) {
        console.log('🎨 Merging drawings with screenshot at full resolution...');
        finalScreenshotData = await mergeWithBackground(screenshotData, canvasId);
        console.log('✅ Drawing merge completed');
      }

      const screenshotsData = [{
        data: finalScreenshotData,
        timestamp: new Date().toISOString(),
        size: finalScreenshotData.length
      }];

      const formData = {
        meeting_id: id,
        name: residentName,
        address: residentAddress,
        post_code: postCode,
        repair_detail: repairDetails,
        target_time: targetTime,
        recordings: [],
        screenshots: screenshotsData,
        update_mode: existingMeetingData ? 'update' : 'create'
      };

      const response = await createRequest(formData);

      toast.success("Screenshot saved successfully!");

      // Clear pencil mode and drawing data
      setActivePencilScreenshot(null);
      setShowPencilDropdown(null);

      // Add saved screenshot to existing screenshots with unique ID
      const newSavedScreenshot = {
        id: `saved-${Date.now()}-${index}-${Math.random()}`,
        url: finalScreenshotData,
        timestamp: new Date().toLocaleString(),
        isExisting: true
      };

      setExistingScreenshots(prev => {
        // Check for duplicates
        const alreadyExists = prev.some(s => s.url === newSavedScreenshot.url);
        if (alreadyExists) {
          console.log('⚠️ Screenshot already in existing array, skipping add');
          return prev;
        }
        return [...prev, newSavedScreenshot];
      });

      // Remove the screenshot from new screenshots array
      deleteScreenshot(index);
      console.log(`🧹 Removed screenshot at index ${index} from new screenshots array`);

    } catch (error) {
      console.error('❌ Save screenshot failed:', error);
      toast.error("Failed to save screenshot");
    } finally {
      setSavingScreenshotIndex(null);
      processedItemsRef.current.delete(itemKey);
    }
  }, [id, residentName, residentAddress, postCode, repairDetails, targetTime, existingMeetingData, drawingData, mergeWithBackground, deleteScreenshot]);

  // Maximize handlers - Memoize these functions
  const maximizeVideo = useCallback((recording) => {
    setMaximizedItem({
      type: 'video',
      id: recording.id,
      data: recording
    });
  }, []);

  const maximizeScreenshot = useCallback((screenshot, index, isExisting = false) => {
    setMaximizedItem({
      type: 'screenshot',
      id: isExisting ? screenshot.id : `new-${index}`,
      data: screenshot,
      index: isExisting ? null : index,
      isExisting
    });
  }, []);

  const closeMaximized = useCallback(() => {
    setMaximizedItem(null);
  }, []);

  // Handle escape key to close maximized view
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && maximizedItem) {
        closeMaximized();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [maximizedItem]);

  // Helper function to get landlord name (prioritize token info)
  const getLandlordName = () => {
    if (tokenLandlordInfo?.landlordName) {
      return tokenLandlordInfo.landlordName;
    }
    return user?.landlordInfo?.landlordName || null;
  };

  // Helper function to get landlord logo (prioritize token info)
  const getLandlordLogo = () => {
    if (tokenLandlordInfo?.landlordLogo && isValidImageUrl(tokenLandlordInfo.landlordLogo)) {
      return tokenLandlordInfo.landlordLogo;
    }
    if (user?.landlordInfo?.landlordLogo && isValidImageUrl(user.landlordInfo.landlordLogo)) {
      return user.landlordInfo.landlordLogo;
    }
    return null;
  };

  // Helper function to get profile image (prioritize token info)
  const getProfileImage = () => {
    // Check token info first
    if (tokenLandlordInfo?.profileImage && isValidImageUrl(tokenLandlordInfo.profileImage)) {
      return tokenLandlordInfo.profileImage;
    }

    // Fallback to current user info
    if (user?.landlordInfo?.useLandlordLogoAsProfile && user?.landlordInfo?.landlordLogo) {
      if (isValidImageUrl(user.landlordInfo.landlordLogo)) {
        return user.landlordInfo.landlordLogo;
      }
    }

    if (user?.landlordInfo?.officerImage) {
      if (isValidImageUrl(user.landlordInfo.officerImage)) {
        return user.landlordInfo.officerImage;
      }
    }

    return null;
  };

  // Helper function to check if image URL is valid
  const isValidImageUrl = (url) => {
    if (!url) return false;
    return url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://');
  };

  // Helper function to get display name (prioritize token info)
  const getDisplayName = () => {
    // Use landlord name if available from token or user
    const landlordName = getLandlordName();
    if (landlordName) {
      return landlordName;
    }

    // Fallback to username from email
    if (user?.email) {
      return user.email.split('@')[0];
    }

    return 'User';
  };

  // Helper function to get initials
  const getInitials = (name) => {
    if (!name) return 'U';

    const words = name.trim().split(' ').filter(word => word.length > 0);
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    } else if (words.length >= 2) {
      return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  // Add useDialog hook to access the share link dialog
  const { setShareLinkOpen } = useDialog();

  // Add function to create and show share link for current meeting
  const handleCreateShareLink = () => {
    if (!id) {
      toast.error("No meeting ID available");
      return;
    }

    // Create a meeting object with current form data for sharing
    const meetingData = {
      meeting_id: id,
      name: residentName,
      address: residentAddress,
      post_code: postCode,
      repair_detail: repairDetails,
      target_time: targetTime,
      createdAt: new Date().toISOString(),
      recordings: recordings, // Using existing recordings array
      screenshots: [...existingScreenshots, ...screenshots.map((screenshot, index) => ({ id: `new-${index}`, url: screenshot }))]
    };

    // Open the share link dialog with meeting data
    setShareLinkOpen(true, meetingData);
  };

  // Add effect to handle client-side hydration right after state declarations
  useEffect(() => {
    setIsClient(true);
  }, []);

  // NEW: Add cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      processedItemsRef.current.clear();
    };
  }, []);

  // Add loading guard to prevent hydration mismatch
  if (!isClient) {
    return (
      <div className="max-w-6xl mx-auto p-4 py-10 font-sans">
        <div className="flex items-center justify-center h-64">
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 py-10 font-sans">
      {/* Maximized Item Modal */}
      {maximizedItem && (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
    <div className="relative w-full h-full flex">
      
      {/* Drawing Tools Panel - Show when in drawing mode */}
      {maximizedItem.drawingMode && (
        <div className="w-80 bg-white p-4 overflow-y-auto flex-shrink-0 drawing-tools-panel">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b">
              <h2 className="text-lg font-semibold">🎨 Drawing Tools</h2>
              <button
                onClick={() => {
                  // Toggle off drawing mode but keep maximized
                  setMaximizedItem(prev => ({ ...prev, drawingMode: false }));
                  setActivePencilScreenshot(null);
                }}
                className="p-1 hover:bg-gray-100 rounded"
                title="Exit Drawing Mode"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Line Width */}
            <div>
              <label className="block text-sm font-medium mb-2">Brush Size: {lineWidth}px</label>
              <input
                type="range"
                min="1"
                max="20"
                value={lineWidth}
                onChange={(e) => setLineWidth(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded appearance-none cursor-pointer"
              />
            </div>

            {/* Tools */}
            <div>
              <label className="block text-sm font-medium mb-2">Tools</label>
              <div className="grid grid-cols-2 gap-2">
                {tools.map((tool) => (
                  <button
                    key={tool.name}
                    onClick={() => setSelectedTool(tool.name)}
                    className={`p-3 text-sm border rounded-lg transition-all hover:scale-105 ${
                      selectedTool === tool.name
                        ? 'bg-blue-100 text-blue-700 border-blue-300'
                        : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                    }`}
                    title={tool.title}
                  >
                    <div className="text-lg mb-1">{tool.icon}</div>
                    <div className="text-xs capitalize">{tool.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div>
              <label className="block text-sm font-medium mb-2">Colors</label>
              <div className="grid grid-cols-6 gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-lg transition-transform border-2 hover:scale-110 ${
                      selectedColor === color 
                        ? 'border-gray-800 scale-110 shadow-lg' 
                        : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    title={`Select ${color}`}
                  />
                ))}
              </div>
            </div>

            {/* Current Settings */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Current Settings</h4>
              <div className="space-y-1 text-sm">
                <div>Tool: <strong>{tools.find(t => t.name === selectedTool)?.title || selectedTool}</strong></div>
                <div className="flex items-center gap-2">
                  Color: 
                  <div 
                    className="w-4 h-4 rounded border border-gray-400" 
                    style={{ backgroundColor: selectedColor }}
                  ></div>
                  <strong>{selectedColor}</strong>
                </div>
                <div>Size: <strong>{lineWidth}px</strong></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-4 border-t">
              <button
                onClick={() => clearCanvas(maximizedItem.id)}
                className="w-full py-2 px-4 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                🗑️ Clear All Drawings
              </button>
              
              <button
                onClick={closeMaximized}
                className="w-full py-2 px-4 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              >
                ✅ Done Editing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Area */}
      <div className="flex-1 flex items-center justify-center relative">
        {/* Close button - always visible */}
        <button
          onClick={closeMaximized}
          className="absolute top-4 right-4 z-20 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Toggle Drawing Mode Button - Only for new screenshots */}
        {maximizedItem.type === 'screenshot' && !maximizedItem.isExisting && (
          <button
            onClick={() => {
              const newDrawingMode = !maximizedItem.drawingMode;
              console.log('🎨 Toggling drawing mode to:', newDrawingMode);
              setMaximizedItem(prev => ({ ...prev, drawingMode: newDrawingMode }));
              if (newDrawingMode) {
                setActivePencilScreenshot(maximizedItem.id);
              } else {
                setActivePencilScreenshot(null);
              }
            }}
            className={`absolute top-4 left-4 z-20 p-2 rounded-full transition-colors ${
              maximizedItem.drawingMode 
                ? 'bg-blue-500 text-white' 
                : 'bg-black bg-opacity-50 text-white hover:bg-opacity-75'
            }`}
            title={maximizedItem.drawingMode ? "Exit Drawing Mode" : "Enter Drawing Mode"}
          >
            <Pencil className="w-6 h-6" />
          </button>
        )}

        {/* Maximized Screenshot with Drawing Canvas */}
        {maximizedItem.type === 'screenshot' && (
          <div className="relative w-full h-full flex items-center justify-center p-8">
            <div 
              className="relative flex items-center justify-center"
              style={{
                maxWidth: '80vw',
                maxHeight: '80vh',
                width: '100%',
                height: '100%'
              }}
            >
              {/* Original Screenshot */}
              <img
                id={`maximized-img-${maximizedItem.id}`}
                src={maximizedItem.isExisting ? maximizedItem.data.url : maximizedItem.data}
                alt="Maximized screenshot"
                className="max-w-full max-h-full object-contain"
                onLoad={(e) => {
                  console.log('📸 Maximized image loaded');
                  
                  if (!maximizedItem.isExisting && maximizedItem.drawingMode) {
                    const img = e.target;
                    const rect = img.getBoundingClientRect();
                    
                    console.log('🎨 Setting up drawing canvas, image rect:', rect);
                    
                    setTimeout(() => {
                      const canvas = document.querySelector(`canvas[data-maximized-canvas-id="${maximizedItem.id}"]`);
                      if (canvas) {
                        console.log('✅ Found maximized canvas, initializing...');
                        
                        // Set canvas size to match displayed image
                        canvas.width = rect.width;
                        canvas.height = rect.height;
                        canvas.style.width = rect.width + 'px';
                        canvas.style.height = rect.height + 'px';
                        canvas.style.position = 'absolute';
                        canvas.style.top = '50%';
                        canvas.style.left = '50%';
                        canvas.style.transform = 'translate(-50%, -50%)';
                        canvas.style.pointerEvents = 'auto';
                        
                        // Initialize drawing canvas
                        initializeCanvas(canvas, maximizedItem.data, maximizedItem.id);
                        
                        console.log('✅ Maximized drawing canvas initialized');
                        
                        // Copy existing drawings if any
                        const sourceCanvas = document.querySelector(`canvas[data-canvas-id="${maximizedItem.id}"]`);
                        if (sourceCanvas && drawingData[maximizedItem.id]?.strokes?.length > 0) {
                          console.log('🔄 Copying existing drawings to maximized canvas');
                          
                          const ctx = canvas.getContext('2d');
                          const scaleX = canvas.width / sourceCanvas.width;
                          const scaleY = canvas.height / sourceCanvas.height;
                          
                          drawingData[maximizedItem.id].strokes.forEach(stroke => {
                            ctx.strokeStyle = stroke.color;
                            ctx.lineWidth = stroke.lineWidth * Math.min(scaleX, scaleY);
                            ctx.lineCap = 'round';
                            ctx.lineJoin = 'round';
                            ctx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over';
                            
                            if (stroke.type === 'path' && stroke.points) {
                              ctx.beginPath();
                              stroke.points.forEach((point, index) => {
                                const x = point.x * scaleX;
                                const y = point.y * scaleY;
                                if (index === 0) {
                                  ctx.moveTo(x, y);
                                } else {
                                  ctx.lineTo(x, y);
                                }
                              });
                              ctx.stroke();
                            }
                          });
                          
                          console.log('✅ Existing drawings copied');
                        }
                      } else {
                        console.error('❌ Maximized canvas not found!');
                      }
                    }, 100);
                  }
                }}
              />

              {/* Interactive Drawing Canvas - Only for new screenshots in drawing mode */}
              {!maximizedItem.isExisting && maximizedItem.drawingMode && (
                <canvas
                  data-maximized-canvas-id={maximizedItem.id}
                  className="absolute cursor-crosshair"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'auto',
                    zIndex: 10
                  }}
                  onMouseDown={(e) => {
                    console.log('🖱️ Mouse down on maximized canvas');
                    e.preventDefault();
                    // Update canvas ID attribute for drawing tools
                    e.target.setAttribute('data-canvas-id', maximizedItem.id);
                    startDrawing(e);
                  }}
                  onMouseMove={(e) => {
                    e.preventDefault();
                    e.target.setAttribute('data-canvas-id', maximizedItem.id);
                    draw(e);
                  }}
                  onMouseUp={(e) => {
                    e.preventDefault();
                    e.target.setAttribute('data-canvas-id', maximizedItem.id);
                    stopDrawing(e);
                  }}
                  onMouseLeave={(e) => {
                    e.preventDefault();
                    e.target.setAttribute('data-canvas-id', maximizedItem.id);
                    stopDrawing(e);
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    const touch = e.touches[0];
                    const mouseEvent = new MouseEvent('mousedown', {
                      clientX: touch.clientX,
                      clientY: touch.clientY
                    });
                    e.target.setAttribute('data-canvas-id', maximizedItem.id);
                    startDrawing(mouseEvent);
                  }}
                  onTouchMove={(e) => {
                    e.preventDefault();
                    const touch = e.touches[0];
                    const mouseEvent = new MouseEvent('mousemove', {
                      clientX: touch.clientX,
                      clientY: touch.clientY
                    });
                    e.target.setAttribute('data-canvas-id', maximizedItem.id);
                    draw(mouseEvent);
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    const mouseEvent = new MouseEvent('mouseup', {});
                    e.target.setAttribute('data-canvas-id', maximizedItem.id);
                    stopDrawing(mouseEvent);
                  }}
                />
              )}
            </div>
          </div>
        )}

        {/* Maximized Video (unchanged) */}
        {maximizedItem.type === 'video' && (
          <video
            src={maximizedItem.data.url}
            controls={true}
            autoPlay={false}
            muted={false}
            className="max-w-full max-h-full w-auto h-auto object-contain"
            style={{
              maxWidth: '95vw',
              maxHeight: '95vh'
            }}
          />
        )}
      </div>
    </div>
  </div>
)}

      <div className="gap-6" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr' }}>
        {/* Left Column */}
        <div className="space-y-6 flex gap-5">
          <div className="flex-1 relative">
            {/* Logo and User */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center">
                <a href="/" className="text-2xl font-bold text-gray-900 flex items-center">
                  <VideoIcon className="mr-2" />
                  <span> Videodesk.co.uk</span>
                </a>
              </div>
            </div>

            {/* User Greeting */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full overflow-hidden">
                {getProfileImage() ? (
                  <img
                    src={getProfileImage()}
                    alt="Profile Image"
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-lg rounded-full">
                    {getInitials(getDisplayName())}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600">Hello,</p>
                <p className="font-semibold">{getDisplayName()}</p>
              </div>
            </div>

            {/* Live Video */}
            <div className="relative w-[270px]">
              <div className="h-[480px] w-[270px] bg-gray-200 rounded-md overflow-hidden relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  controls={false}
                  className="w-full h-full object-contain absolute top-0 left-0 transition-transform duration-300 ease-out"
                  style={{
                    // Apply zoom and pan transformations
                    transform: `scale(${zoomLevel}) translate(${videoPanX}px, ${videoPanY}px)`,
                    transformOrigin: 'center center',
                    // Hide all video controls and UI elements during recording
                    ...(isRecording && {
                      pointerEvents: 'none',
                      outline: 'none',
                      border: 'none'
                    }),
                    // Enable panning when zoomed in
                    ...(zoomLevel > 1 && !isRecording && {
                      cursor: 'grab'
                    })
                  }}
                  onMouseMove={handleVideoPan}
                  onMouseDown={(e) => {
                    if (zoomLevel > 1) {
                      e.currentTarget.style.cursor = 'grabbing';
                    }
                  }}
                  onMouseUp={(e) => {
                    if (zoomLevel > 1) {
                      e.currentTarget.style.cursor = 'grab';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (zoomLevel > 1) {
                      e.currentTarget.style.cursor = 'grab';
                    }
                  }}
                />
              </div>

              {/* Recording Timer Overlay - Shows during recording */}
              {isRecording && (
                <div className="absolute top-2 left-2 bg-red-600 text-white px-3 py-1 text-sm font-medium flex items-center gap-2 rounded-md">
                  <span className="w-3 h-3 rounded-full bg-white animate-pulse"></span>
                  <span>REC {formatRecordingTime(currentRecordingDuration)}</span>
                </div>
              )}

              <div
                className="absolute top-2 left-2 bg-red-600 text-white px-3 py-1 text-sm font-medium"
                style={{ display: isRecording ? 'none' : 'block' }}
              >
                {isConnected ? "Live" : "Disconnected"}
              </div>

              {
                showVideoPlayError &&
                <button
                  className="w-[3rem] h-[3rem] bg-amber-500 text-white rounded-full absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] flex items-center justify-center cursor-pointer"
                  title={`Play Video`}
                  onClick={handleVideoPlay}
                >
                  <Play />
                </button>
              }

              <div
                className="absolute bottom-2 left-[50%] -translate-x-[50%] text-white px-3 py-1 text-sm font-medium flex items-center gap-3"
                style={{ display: isRecording ? 'none' : 'flex' }}
              >
                <span className="w-4 h-4 rounded-full bg-red-600 block"></span>
                <span className="text-white text-lg">{isConnected ? formatTime(callDuration) : "0:00"}</span>
              </div>

              <div
                className="absolute bottom-2 right-0 text-white px-3 py-1 text-sm font-medium flex items-center gap-3 flex-col"
                style={{ display: isRecording ? 'none' : 'flex' }}
              >
                <button
                  className="p-1 rounded text-white cursor-pointer hover:bg-black/20 transition-colors"
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 3}
                  title={`Zoom In (${Math.round(zoomLevel * 100)}%)`}
                >
                  <ZoomIn className={`w-4 h-4 ${zoomLevel >= 3 ? 'opacity-50' : ''}`} />
                </button>

                {/* Zoom level indicator - clickable to reset */}
                <button
                  className="text-xs bg-black/30 px-2 py-1 rounded hover:bg-black/50 transition-colors"
                  onClick={handleZoomReset}
                  title="Click to reset zoom"
                >
                  {Math.round(zoomLevel * 100)}%
                </button>

                <button
                  className="p-1 rounded text-white cursor-pointer hover:bg-black/20 transition-colors"
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 0.5}
                  title={`Zoom Out (${Math.round(zoomLevel * 100)}%)`}
                >
                  <ZoomOut className={`w-4 h-4 ${zoomLevel <= 0.5 ? 'opacity-50' : ''}`} />
                </button>
              </div>
            </div>

            <div className="w-[270px] flex gap-2 mt-2">
              <button
                onClick={handleRecordingToggle}
                disabled={!isConnected}
                className={`disabled:opacity-50 flex items-center justify-center gap-2 font-medium py-4 rounded-md transition-colors flex-1 ${isRecording
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
              >
                <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <span className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500' : 'bg-green-500'}`}></span>
                </span>
                {isRecording ? `Stop (${formatRecordingTime(currentRecordingDuration)})` : 'Recording'}
              </button>

              <button onClick={takeScreenshot} disabled={!isConnected} className="disabled:opacity-50 flex items-center justify-center gap-2 bg-orange-400 hover:bg-orange-500 text-white font-medium py-4 rounded-md transition-colors flex-1">
                <Maximize2 className="w-5 h-5" />
                Screenshot
              </button>
            </div>

          </div>

          <div className="flex-1 flex flex-col gap-10">
            {/* Resident Name Section */}
            <div className="">
              <label htmlFor="residentName" className="block text-lg font-medium mb-5">
                Resident Name :
              </label>
              <textarea
                id="residentName"
                value={residentName}
                onChange={(e) => setResidentName(e.target.value)}
                placeholder="Enter resident's name"
                rows={1}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>

            {/* Video Recording Section */}
            <div>
              <h2 className="text-lg font-medium mb-3">Video Recording :</h2>
              <div className="grid grid-cols-2 gap-3">
                {recordings.length === 0 && (
                  <h1>No recordings</h1>
                )}

                {recordings.map((recording) => (
                  <div key={recording.id} className="relative group">
                    <img src="/icons/ci_label.svg" className="mb-2" />
                    <div
                      data-recording-id={recording.id}
                      className="aspect-square bg-gray-200 rounded-md overflow-hidden relative cursor-pointer"
                      onClick={(e) => {
                        const video = e.currentTarget.querySelector('video');
                        if (video.paused) {
                          video.play();
                        } else {
                          video.pause();
                        }
                      }}>

                      <video
                        src={recording.url}
                        controls={true}
                        muted={false}
                        className="w-full h-full object-cover"
                        onPlay={() => setPlayingVideos(prev => new Set(prev).add(recording.id))}
                        onPause={() => setPlayingVideos(prev => {
                          const newSet = new Set(prev);
                          newSet.delete(recording.id);
                          return newSet;
                        })}
                      />

                      {/* Action icons moved to top left corner, vertical alignment */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            saveIndividualRecording(recording);
                          }}
                          className={`p-1 hover:bg-black/20 rounded text-white ${recording.isExisting || savingRecordingId === recording.id ? 'opacity-50' : ''}`}
                          title={recording.isExisting ? "Already saved" : "Save recording"}
                          disabled={recording.isExisting || savingRecordingId === recording.id}
                        >
                          {savingRecordingId === recording.id ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteRecording(recording);
                          }}
                          className="p-1 hover:bg-black/20 rounded text-white"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Minimize/Maximize icons at top right corner, horizontal alignment */}
                      <div className="absolute top-2 right-2 flex flex-row gap-1 z-10">
                        <button
                          className="p-1 hover:bg-black/20 rounded text-white"
                          title="Minimize"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Minimize2 className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1 hover:bg-black/20 rounded text-white"
                          title="Maximize"
                          onClick={(e) => {
                            e.stopPropagation();
                            maximizeVideo(recording);
                          }}
                        >
                          <Expand className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Image Screenshot Section */}
            <div>
              <h2 className="text-lg font-medium mb-3">Image screenshot :</h2>

              {/* Grid with overflow-visible to allow dropdown to show */}
              <div className="grid grid-cols-2 gap-3 overflow-visible">
                {(existingScreenshots.length === 0 && screenshots.length === 0) && (
                  <h1>No screenshots</h1>
                )}

                {/* Render existing screenshots first */}
                {existingScreenshots.map((screenshot, index) => (
                  <div key={`existing-${screenshot.id}`}>
                    <img src="/icons/ci_label.svg" className="mb-2" />
                    <div className="aspect-square bg-gray-200 rounded-md overflow-hidden flex items-center justify-center relative">
                      <div className="absolute top-2 right-2 flex flex-row gap-1 z-10">
                        <button className="p-1 hover:bg-black/20 rounded text-white">
                          <Minimize2 className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1 hover:bg-black/20 rounded text-white"
                          onClick={() => maximizeScreenshot(screenshot, index, true)}
                        >
                          <Expand className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Action icons for existing screenshots */}
                      <div className="absolute bottom-2 right-2 flex flex-col gap-1 z-10">
                        <button className="p-1 hover:bg-black/20 rounded text-white opacity-50" disabled>
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button className="p-1 hover:bg-black/20 rounded text-white opacity-50" disabled title="Already saved">
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteExistingScreenshot(screenshot)}
                          className="p-1 hover:bg-black/20 rounded text-white"
                          title="Delete screenshot"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Existing Screenshot Image */}
                      <img
                        src={screenshot.url}
                        alt="existing screenshot"
                        className="w-full h-full object-fill absolute top-0 left-0 z-0 rounded-md"
                      />
                    </div>
                  </div>
                ))}

                {/* Render new screenshots from useWebRTC with RIGHT DROPDOWN */}
                {screenshots.map((screenshot, index) => {
                  const canvasId = `new-${index}`;
                  const isActive = activePencilScreenshot === canvasId;
                  const shouldShowDropdown = showPencilDropdown === canvasId;

                  return (
                    <div key={canvasId} className="relative pencil-dropdown-container">
                      <img src="/icons/ci_label.svg" className="mb-2" />
                      <div className="aspect-square bg-gray-200 rounded-md overflow-visible flex items-center justify-center relative">
                        {/* Minimize/Maximize icons */}
                        <div className="absolute top-2 right-2 flex flex-row gap-1 z-20">
                          <button className="p-1 hover:bg-black/20 rounded text-white">
                            <Minimize2 className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1 hover:bg-black/20 rounded text-white"
                            onClick={() => maximizeScreenshot(screenshot, index, false)}
                          >
                            <Expand className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Action icons */}
                        <div className="absolute bottom-2 right-2 flex flex-col gap-1 z-20">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('🖋️ Pencil clicked for:', canvasId);
                              // Call handlePencilClick with correct parameters
                              handlePencilClick(canvasId, screenshot, index);
                            }}
                            className="p-1 hover:bg-black/20 rounded text-white transition-colors"
                            title="Edit in full screen"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => saveIndividualScreenshot(screenshot, index)}
                            className={`p-1 hover:bg-black/20 rounded text-white ${savingScreenshotIndex === index ? 'opacity-80' : ''}`}
                            title="Save screenshot"
                            disabled={savingScreenshotIndex === index}
                          >
                            {savingScreenshotIndex === index ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => deleteNewScreenshot(index)}
                            className="p-1 hover:bg-black/20 rounded text-white"
                            title="Delete screenshot"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Screenshot Image */}
                        <img
                          src={screenshot}
                          alt="new screenshot"
                          className="w-full h-full object-fill absolute top-0 left-0 z-0 rounded-md"
                        />

                        {/* ALWAYS VISIBLE Canvas for drawings */}
                        <canvas
                          data-canvas-id={canvasId}
                          ref={(canvas) => {
                            if (canvas) {
                              canvas.setAttribute('data-background', screenshot);
                              initializeCanvas(canvas, screenshot, canvasId);
                            }
                          }}
                          className={`absolute top-0 left-0 w-full h-full z-10 rounded-md ${isActive ? 'cursor-crosshair' : 'pointer-events-none'
                            }`}
                          onMouseDown={(e) => {
                            if (isActive) {
                              e.preventDefault();
                              startDrawing(e);
                            }
                          }}
                          onMouseMove={(e) => {
                            if (isActive) {
                              e.preventDefault();
                              draw(e);
                            }
                          }}
                          onMouseUp={(e) => {
                            if (isActive) {
                              e.preventDefault();
                              stopDrawing(e);
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (isActive) {
                              e.preventDefault();
                              stopDrawing(e);
                            }
                          }}
                          onTouchStart={(e) => {
                            if (isActive) {
                              e.preventDefault();
                              const touch = e.touches[0];
                              const mouseEvent = new MouseEvent('mousedown', {
                                clientX: touch.clientX,
                                clientY: touch.clientY
                              });
                              startDrawing(mouseEvent);
                            }
                          }}
                          onTouchMove={(e) => {
                            if (isActive) {
                              e.preventDefault();
                              const touch = e.touches[0];
                              const mouseEvent = new MouseEvent('mousemove', {
                                clientX: touch.clientX,
                                clientY: touch.clientY
                              });
                              draw(mouseEvent);
                            }
                          }}
                          onTouchEnd={(e) => {
                            if (isActive) {
                              e.preventDefault();
                              const mouseEvent = new MouseEvent('mouseup', {});
                              stopDrawing(mouseEvent);
                            }
                          }}
                        />

                        {/* RIGHT SIDE DROPDOWN - Compact Version */}
                        {shouldShowDropdown && (
                          <div className="absolute left-full top-0 ml-2 bg-white border border-gray-300 rounded-md shadow-lg p-2 min-w-[200px] z-50 max-h-[350px] overflow-y-auto">
                            <div className="space-y-2">
                              {/* Header with Close Button */}
                              <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                                <h3 className="text-xs font-medium text-gray-800">🎨 Tools</h3>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log('🖋️ Closing dropdown via X button');
                                    setShowPencilDropdown(null);
                                    setActivePencilScreenshot(null);
                                  }}
                                  className="p-0.5 hover:bg-gray-100 rounded transition-colors"
                                  title="Close"
                                >
                                  <X className="w-3 h-3 text-gray-600" />
                                </button>
                              </div>

                              {/* Line Width */}
                              <div>
                                <p className="text-xs font-medium text-gray-700 mb-1">Size:</p>
                                <input
                                  type="range"
                                  min="1"
                                  max="15"
                                  value={lineWidth}
                                  onChange={(e) => setLineWidth(parseInt(e.target.value))}
                                  className="w-full h-1 bg-gray-200 rounded appearance-none cursor-pointer"
                                />
                                <div className="text-xs text-gray-500 text-center">{lineWidth}px</div>
                              </div>

                              {/* Action Buttons */}
                              <div className="pb-2 border-b border-gray-200">
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    console.log('🖋️ Clear button clicked for:', canvasId);
                                    clearCanvas(canvasId);
                                  }}
                                  className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded border hover:bg-red-100 transition-colors w-full"
                                  title="Clear all drawings"
                                >
                                  🗑️ Clear
                                </button>
                              </div>

                              {/* Tools Section */}
                              <div>
                                <p className="text-xs font-medium text-gray-700 mb-1">Tools:</p>
                                <div className="grid grid-cols-3 gap-1">
                                  {tools.map((tool) => (
                                    <button
                                      key={tool.name}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        console.log('🖋️ Tool selected:', tool.name);
                                        setSelectedTool(tool.name);
                                      }}
                                      className={`w-full h-7 flex items-center justify-center text-xs border rounded transition-all hover:scale-105 ${selectedTool === tool.name
                                        ? 'bg-blue-100 text-blue-700 border-blue-300'
                                        : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                                        }`}
                                      title={tool.title}
                                    >
                                      <span className="text-sm">{tool.icon}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Colors Section */}
                              <div>
                                <p className="text-xs font-medium text-gray-700 mb-1">Colors:</p>
                                <div className="grid grid-cols-6 gap-1">
                                  {colors.map((color) => (
                                    <button
                                      key={color}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        console.log('🖋️ Color selected:', color);
                                        setSelectedColor(color);
                                      }}
                                      className={`w-6 h-6 rounded-full transition-transform border hover:scale-110 ${selectedColor === color ? 'border-gray-800 scale-110 shadow-md' : 'border-gray-300'
                                        }`}
                                      style={{ backgroundColor: color }}
                                      title={`Select ${color}`}
                                    />
                                  ))}
                                </div>
                              </div>

                              {/* Current Settings Display */}
                              <div className="pt-2 border-t border-gray-200">
                                <p className="text-xs text-gray-600 bg-gray-50 p-1.5 rounded text-center">
                                  <strong>{tools.find(t => t.name === selectedTool)?.title}</strong>
                                  {selectedTool !== 'eraser' && (
                                    <>
                                      {' '}- <span
                                        className="inline-block w-2 h-2 rounded-full border border-gray-400 align-middle mx-0.5"
                                        style={{ backgroundColor: selectedColor }}
                                      ></span>
                                      {' '}- {lineWidth}px
                                    </>
                                  )}
                                </p>
                              </div>

                              {/* Start Drawing Button */}
                              <div>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    console.log('🖋️ Start Drawing clicked for:', canvasId);
                                    setShowPencilDropdown(null);
                                    // Keep activePencilScreenshot active for drawing
                                  }}
                                  className="w-full py-1.5 px-3 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 transition-colors"
                                >
                                  ✏️ Draw
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - MOVED OUTSIDE LEFT COLUMN */}
        <div className="space-y-6">
          {/* Resident Information */}
          <div>
            <div className="flex flex-col md:flex-row md:justify-between gap-4 mb-6">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">

                  <label htmlFor="residentAddress" className="block text-lg font-medium mb-2">
                    Resident Address :
                  </label>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className={"bg-amber-500 text-white rounded-3xl flex items-center gap-2 text-xl"}>Actions <img src="/icons/arrow-down.svg" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className={'bg-white border-none shadow-sm'}>
                      <DropdownMenuItem>
                        <button className='bg-none border-none cursor-pointer' onClick={handleLogout}>Logout</button>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <button className='bg-none border-none cursor-pointer' onClick={handleDashboard}>Dashboard</button>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <button className='bg-none border-none cursor-pointer' onClick={() => setTickerOpen(true)}>Raise Support Ticket</button>
                      </DropdownMenuItem>
                      <DropdownMenuItem><button className='bg-none border-none cursor-pointer' onClick={() => setResetOpen(true)}>Reset Password</button></DropdownMenuItem>
                      <DropdownMenuItem > <button className='bg-none border-none cursor-pointer' onClick={() => setInviteOpen(true)}>Invite Coworkers</button></DropdownMenuItem>
                      <DropdownMenuItem><button className='bg-none border-none cursor-pointer' onClick={() => setMessageOpen(true)}>Amend Message</button></DropdownMenuItem>
                      <DropdownMenuItem> <button className='bg-none border-none cursor-pointer text-left' onClick={() => setLandlordDialogOpen(true)}>Add Landlord Name/Logo/ <br />Profile Image </button></DropdownMenuItem>
                      <DropdownMenuItem > <button className='bg-none border-none cursor-pointer' onClick={() => setFaqOpen(true)}>FAQ's</button></DropdownMenuItem>
                      <DropdownMenuItem > <button className='bg-none border-none cursor-pointer' onClick={() => setFeedbackOpen(true)}>Give Feedback</button></DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                </div>
                <textarea
                  id="residentAddress"
                  value={residentAddress}
                  onChange={(e) => setResidentAddress(e.target.value)}
                  placeholder="Enter resident's address"
                  rows={1}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>
            </div>
            <div className="mb-6">
              <textarea
                placeholder="Post code:"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300"
                rows={1}
              />
            </div>
            <div className="mb-6">
              <textarea
                id="postCode"
                value={postCode}
                onChange={(e) => setPostCode(e.target.value)}
                placeholder="Ref:"
                rows={1}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
          </div>

          {/* Repair Details */}
          <div>
            <label htmlFor="repairDetails" className="block text-lg font-medium mb-2">
              Repair details :
            </label>
            <textarea
              id="repairDetails"
              value={repairDetails}
              onChange={(e) => setRepairDetails(e.target.value)}
              placeholder="Description of repair"
              rows={5}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>

          {/* Target Time */}
          <div className="relative">
            <label htmlFor="targetTime" className="block text-lg font-medium mb-2">
              Target time :
            </label>
            <div className="flex items-start gap-2">
              <div className="relative flex-1">
                <button
                  type="button"
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-full flex items-center justify-between p-3 bg-orange-100 rounded-md text-left"
                >
                  <span>{targetTime}</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${showDropdown ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                    <ul>
                      <li
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setTargetTime("Emergency 24 Hours")
                          setShowDropdown(false)
                        }}
                      >
                        Emergency 24 Hours
                      </li>
                      <li
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setTargetTime("Urgent (7 Days)")
                          setShowDropdown(false)
                        }}
                      >
                        Urgent (7 Days)
                      </li>
                      <li
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setTargetTime("Routine (28 Days)")
                          setShowDropdown(false)
                        }}
                      >
                        Routine (28 Days)
                      </li>
                      <li
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setTargetTime("Follow Up Work")
                          setShowDropdown(false)
                        }}
                      >
                        Follow Up Work
                      </li>
                      <li
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setTargetTime("Other")
                          setShowDropdown(false)
                        }}
                      >
                        Other
                      </li>
                    </ul>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2 items-end">

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaveDisabled()}
                  className="w-full flex items-center justify-center p-3 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md transition-colors"
                >
                  {isSaving ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </div>
                  ) : (
                    'Save repair'
                  )}
                </button>
                <button className="p-2 bg-gray-100 rounded-md hover:bg-gray-200">
                  <Plus className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Generate Link Button */}
          <button
            onClick={handleCreateShareLink}
            className="w-full bg-orange-400 hover:bg-orange-500 text-white font-medium py-4 rounded-md transition-colors mt-8 mb-2 flex flex-col gap-1 items-center justify-center"
          >
            <span>Create Share Link</span>
            <span className="text-xs font-normal">to send to Contractor/Supplier or Co-workers</span>
          </button>
          <p className="text-center text-gray-600 mt-0 text-sm">(Copy and paste link to your job ticket or any system)</p>

          <div className="w-full flex items-center gap-4">
            <button onClick={handleDisconnect} disabled={!isConnected} className="bg-red-500 disabled:opacity-50 hover:bg-red-600 text-white font-medium py-4 rounded-md transition-colors flex-1 whitespace-pre">
              End Video <br /> (Without Saving)
            </button>
            <button
              onClick={handleEndVideoAndSave}
              disabled={isSaveDisabled()}
              className="bg-green-500 disabled:opacity-50 hover:bg-green-600 text-white font-medium py-4 rounded-md transition-colors flex-1 whitespace-pre"
            >
              {isEndingSave ? (
                <div className="flex flex-col items-center gap-1">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs">Ending & Saving...</span>
                </div>
              ) : (
                <>
                  End Video and <br />
                  Save Images
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Footer with token info indicator */}
      <div className="flex items-center justify-between mt-5">
        <p className="text-xs">
          User : {getDisplayName()} {isClient ? new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : ''}, {isClient ? new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase() : ''}
        </p>
        {tokenLandlordInfo && (
          <p className="text-xs text-green-600">✓ Using profile info from video link</p>
        )}
      </div>
    </div>
  )
}