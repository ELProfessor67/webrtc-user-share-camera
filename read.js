// ...existing code...

// NEW: Extract common save logic - UPDATED to properly handle drawings
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

  // FIXED: Process screenshots with duplicate prevention AND drawings merge
  const screenshotsData = [];
  const processedScreenshots = new Set();
  
  for (let i = 0; i < screenshots.length; i++) {
    const screenshot = screenshots[i];
    
    // Handle different screenshot formats (object or string)
    let screenshotIdentifier;
    let screenshotData;
    let screenshotId;
    
    if (typeof screenshot === 'object' && screenshot !== null) {
      screenshotIdentifier = screenshot.id || screenshot.data?.substring(0, 50) || `screenshot-${i}`;
      screenshotData = screenshot.data || screenshot;
      screenshotId = screenshot.id || `screenshot-${screenshot.timestamp || Date.now()}-${Math.random()}`;
    } else if (typeof screenshot === 'string') {
      screenshotIdentifier = screenshot.substring(0, 50);
      screenshotData = screenshot;
      screenshotId = `screenshot-${i}-${Date.now()}-${Math.random()}`;
    } else {
      screenshotIdentifier = `screenshot-${i}`;
      screenshotData = `fallback-screenshot-${i}`;
      screenshotId = `screenshot-${i}-${Date.now()}-${Math.random()}`;
    }
    
    const screenshotKey = `screenshot-${i}-${screenshotIdentifier}`;
    
    if (processedScreenshots.has(screenshotKey)) {
      console.log('⚠️ Skipping duplicate screenshot:', screenshotKey);
      continue;
    }
    
    processedScreenshots.add(screenshotKey);
    
    try {
      let finalScreenshotData = typeof screenshotData === 'string' ? screenshotData : String(screenshotData);
      if (finalScreenshotData.indexOf('#') > 0) {
        finalScreenshotData = finalScreenshotData.split('#')[0]; // Clean URL
      }
      
      // FIXED: Use screenshotId as canvasId to match the drawing system
      const canvasId = screenshotId;

      console.log(`🎨 Checking for drawings in canvas ${canvasId} for screenshot ${i + 1}`);
      console.log('📊 Available drawing data keys:', Object.keys(drawingData));

      // CRITICAL FIX: Check for drawings and merge them properly
      let hasDrawings = false;
      if (drawingData[canvasId] && drawingData[canvasId].strokes && drawingData[canvasId].strokes.length > 0) {
        console.log(`🎨 Found ${drawingData[canvasId].strokes.length} strokes for screenshot ${i + 1}. Merging drawings...`);
        try {
          const mergedData = await mergeWithBackground(finalScreenshotData, canvasId);
          if (mergedData && mergedData !== finalScreenshotData) {
            finalScreenshotData = mergedData;
            hasDrawings = true;
            console.log(`✅ Drawing merge completed for screenshot ${i + 1}`);
          } else {
            console.log(`⚠️ Merge returned same data for screenshot ${i + 1}`);
          }
        } catch (mergeError) {
          console.error(`❌ Error merging drawings for screenshot ${i + 1}:`, mergeError);
        }
      } else {
        // ADDITIONAL CHECK: Try alternative canvasId formats
        const alternativeCanvasIds = [
          `new-${i}`,
          `screenshot-${i}`,
          screenshotIdentifier
        ];
        
        for (const altCanvasId of alternativeCanvasIds) {
          if (drawingData[altCanvasId] && drawingData[altCanvasId].strokes && drawingData[altCanvasId].strokes.length > 0) {
            console.log(`🎨 Found drawings in alternative canvas ID: ${altCanvasId} for screenshot ${i + 1}`);
            try {
              const mergedData = await mergeWithBackground(finalScreenshotData, altCanvasId);
              if (mergedData && mergedData !== finalScreenshotData) {
                finalScreenshotData = mergedData;
                hasDrawings = true;
                console.log(`✅ Drawing merge completed using alternative ID ${altCanvasId} for screenshot ${i + 1}`);
                break;
              }
            } catch (mergeError) {
              console.error(`❌ Error merging drawings with alternative ID ${altCanvasId}:`, mergeError);
            }
          }
        }
        
        if (!hasDrawings) {
          console.log(`ℹ️ No drawings found for screenshot ${i + 1} (tried canvas IDs: ${canvasId}, ${alternativeCanvasIds.join(', ')})`);
        }
      }

      screenshotsData.push({
        data: finalScreenshotData,
        timestamp: new Date().toISOString(),
        size: finalScreenshotData.length,
        hasDrawings: hasDrawings,
        originalIndex: i,
        canvasId: canvasId
      });
      
      console.log(`✅ Screenshot ${i + 1} processed successfully with drawings: ${hasDrawings}`);
    } catch (error) {
      console.error(`❌ Error processing screenshot ${i + 1}:`, error);
      // Fallback handling for invalid screenshot data
      let fallbackData;
      try {
        fallbackData = typeof screenshotData === 'object' ? JSON.stringify(screenshotData) : String(screenshotData);
        if (typeof fallbackData === 'string' && fallbackData.indexOf('#') > 0) {
          fallbackData = fallbackData.split('#')[0];
        }
      } catch (fallbackError) {
        console.error('Failed to create fallback screenshot data:', fallbackError);
        fallbackData = `fallback-screenshot-${i}`;
      }
      
      screenshotsData.push({
        data: fallbackData,
        timestamp: new Date().toISOString(),
        size: typeof fallbackData === 'string' ? fallbackData.length : 0,
        hasDrawings: false,
        originalIndex: i,
        canvasId: screenshotId
      });
    }
  }

  const formData = {
    meeting_id: id,
    name: residentName,
    address: residentAddress,
    post_code: actualPostCode, // Save the actual postcode
    reference: postCode, // Save the reference field
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
    screenshots_with_drawings: screenshotsData.filter(s => s.hasDrawings).length,
    existing_recordings_count: existingRecordings.length,
    total_recordings_after_save: existingRecordings.length + recordingsData.length
  });

  const response = await createRequest(formData);
  console.log('✅ Save successful!');

  // Reset pencil mode and clear drawing data for processed screenshots
  setActivePencilScreenshot(null);
  setShowPencilDropdown(null);

  // Clear drawing data for processed screenshots
  screenshotsData.forEach(screenshot => {
    if (screenshot.canvasId && drawingData[screenshot.canvasId]) {
      console.log('🧹 Clearing drawing data for:', screenshot.canvasId);
      delete drawingData[screenshot.canvasId];
    }
  });

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
      isExisting: true,
      hasDrawings: screenshot.hasDrawings,
      quality: 'high'
    }));

    setExistingScreenshots(prev => {
      // Filter out any potential duplicates based on URL
      const existingUrls = new Set(prev.map(s => s.url));
      const uniqueNewScreenshots = newSavedScreenshots.filter(s => !existingUrls.has(s.url));
      
      if (uniqueNewScreenshots.length !== newSavedScreenshots.length) {
        console.log('⚠️ Filtered out duplicate screenshots');
      }
      
      // Add to the end of the array instead of beginning for chronological order
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
      post_code: actualPostCode,
      reference: postCode,
      repair_detail: repairDetails,
      target_time: targetTime
    });
  }

  return { recordingsData, screenshotsData };
}, [
  recordings, screenshots, drawingData, mergeWithBackground, deleteScreenshot,
  id, residentName, residentAddress, actualPostCode, postCode, repairDetails, targetTime, existingMeetingData
]);

// ...existing code...