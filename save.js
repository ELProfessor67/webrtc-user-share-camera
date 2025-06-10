            <DialogComponent open={historyOpen} setOpen={setHistoryOpen} isCloseable={true}>
        <div className="w-[600px] max-h-[90vh] rounded-2xl bg-purple-500 shadow-md overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-center bg-purple-500 text-white p-4 m-0 relative">
            <div className="flex items-center gap-2">
              <img src="/icons/icon-park-outline_history-query.svg" className="w-5 h-5 filter brightness-0 invert" />
              <h2 className="text-base font-semibold">Access History</h2>
            </div>
            <button
              onClick={() => setHistoryOpen(false)}
              aria-label="Close"
              className="absolute right-4 text-white hover:text-gray-200"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 bg-white rounded-b-2xl max-h-[calc(90vh-4rem)] overflow-y-auto">
            {selectedMeetingForHistory ? (
              <div className="space-y-4">
                {/* Meeting Info Header */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">ID:</span>
                      <p className="text-gray-600">{selectedMeetingForHistory.meeting_id}</p>
                    </div>
                    <div>
                      <span className="font-medium">Resident:</span>
                      <p className="text-gray-600">{selectedMeetingForHistory.name || 'Unknown'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Address:</span>
                      <p className="text-gray-600">{selectedMeetingForHistory.address || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Created:</span>
                      <p className="text-gray-600">{formatHistoryDate(selectedMeetingForHistory.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Access Statistics */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Access Statistics</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedMeetingForHistory.total_access_count || selectedMeetingForHistory.access_history?.length || 0}
                      </div>
                      <div className="text-xs text-gray-600">Total Accesses</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {getUniqueVisitors(selectedMeetingForHistory.access_history).length}
                      </div>
                      <div className="text-xs text-gray-600">Unique Visitors</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {selectedMeetingForHistory.access_history?.length > 0 ?
                          formatHistoryDate(selectedMeetingForHistory.access_history[selectedMeetingForHistory.access_history.length - 1].access_time).split(' ')[0] :
                          'N/A'
                        }
                      </div>
                      <div className="text-xs text-gray-600">Last Access</div>
                    </div>
                  </div>
                </div>

                {/* Access History List - Only Unique Visitors */}
                <div>
                  <h4 className="font-semibold mb-3">Unique Visitor Access Log</h4>
                  {(() => {
                    const uniqueVisitors = getUniqueVisitors(selectedMeetingForHistory.access_history);

                    if (uniqueVisitors.length > 0) {
                      return (
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                          {uniqueVisitors.map((access, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-blue-600 font-semibold text-lg">
                                    {access.visitor_name ? access.visitor_name.charAt(0).toUpperCase() : 'V'}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <p className="font-semibold text-base text-gray-900">
                                    {access.visitor_name || 'Unknown Visitor'}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {access.visitor_email || 'No email provided'}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <div className="text-xs text-gray-400 mb-1">
                                    #{index + 1}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Latest: {formatHistoryDate(access.access_time)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    } else {
                      return (
                        <div className="text-center py-8 text-gray-500">
                          <img src="/icons/icon-park-outline_history-query.svg" className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No visitor access recorded yet</p>
                          <p className="text-sm">When someone visits the shared link, their access will be logged here.</p>
                        </div>
                      );
                    }
                  })()}
                </div>

                {/* Meeting Content Summary */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Content Summary</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 p-3 rounded">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Video Recordings</span>
                        <span className="text-lg font-bold text-green-600">
                          {selectedMeetingForHistory.recordings?.length || 0}
                        </span>
                      </div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Screenshots</span>
                        <span className="text-lg font-bold text-blue-600">
                          {selectedMeetingForHistory.screenshots?.length || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Share Link */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm font-medium block mb-2">Share Link:</span>
                  <div className="flex items-center gap-2">
                    <code className="bg-white p-2 rounded text-xs flex-1 border">
                      {`${window.location.origin}/share/${selectedMeetingForHistory.meeting_id}`}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/share/${selectedMeetingForHistory.meeting_id}`);
                        toast.success("Link copied to clipboard!");
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Not selected</p>
              </div>
            )}
          </div>
        </div>
      </DialogComponent>
      {/* Create share Link */}
      <DialogComponent open={shareLinkOpen} setOpen={setShareLinkOpen} isCloseable={true}>
        <div className="w-[400px] max-h-[90vh] rounded-2xl bg-purple-500 shadow-md overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-center bg-purple-500 text-white p-4 m-0 relative">
            <div className="flex items-center gap-2">
              <Link className="w-5 h-5 text-white" />
              <h2 className="text-base font-semibold">Share Meeting</h2>
            </div>
            <button
              onClick={() => setShareLinkOpen(false)}
              aria-label="Close"
              className="absolute right-4 text-white hover:text-gray-200"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 bg-white rounded-b-2xl max-h-[calc(90vh-4rem)] overflow-y-auto">
            {selectedMeetingForShare ? (
              <div className="space-y-4">
                {/* Meeting Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Meeting Details</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">ID:</span> {selectedMeetingForShare.meeting_id}
                    </div>
                    <div>
                      <span className="font-medium">Resident:</span> {selectedMeetingForShare.name || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Address:</span> {selectedMeetingForShare.address || 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Share Link */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Share Link</h4>
                  <div className="flex items-center gap-2">
                    <code className="bg-white p-2 rounded text-xs flex-1 border">
                      {(() => {
                        const fullLink = generateShareLink(selectedMeetingForShare.meeting_id);
                        return fullLink.length > 30 ? `${fullLink.substring(0, 30)}.....` : fullLink;
                      })()}
                    </code>
                    <button
                      onClick={() => {
                        if (!selectedMeetingForShare) {
                          toast.error("No meeting selected for sharing");
                          return;
                        }

                        setExportLoading(prev => ({ ...prev, share: true }));

                        const shareLink = generateShareLink(selectedMeetingForShare.meeting_id);

                        try {
                          // Modern browsers with Clipboard API
                          if (navigator.clipboard && window.isSecureContext) {
                            navigator.clipboard.writeText(shareLink);
                            toast.success("Share link copied to clipboard!");
                          }
                          // Fallback for older browsers
                          else {
                            const textArea = document.createElement('textarea');
                            textArea.value = shareLink;
                            textArea.style.position = 'fixed';
                            textArea.style.left = '-999999px';
                            textArea.style.top = '-999999px';
                            document.body.appendChild(textArea);
                            textArea.focus();
                            textArea.select();

                            try {
                              const successful = document.execCommand('copy');
                              if (successful) {
                                toast.success("Share link copied to clipboard!");
                              } else {
                                throw new Error('Copy command failed');
                              }
                            } catch (err) {
                              // Final fallback - show the link in a prompt
                              window.prompt('Copy this link:', shareLink);
                              toast.success("Link displayed for manual copy");
                            }

                            document.body.removeChild(textArea);
                          }
                        } catch (error) {
                          console.error('Failed to copy share link:', error);
                          // Ultimate fallback - show in alert
                          window.alert(`Copy this link: ${shareLink}`);
                          toast.error("Please copy the link manually from the alert");
                        } finally {
                          setExportLoading(prev => ({ ...prev, share: false }));
                        }
                      }}
                      disabled={exportLoading.share}
                      className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-3 py-2 rounded text-xs font-medium transition-colors flex items-center gap-1"
                    >
                      {exportLoading.share ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Copying...
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Content Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-3 rounded">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">
                        {selectedMeetingForShare.recordings?.length || 0}
                      </div>
                      <div className="text-xs text-gray-600">Videos</div>
                    </div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded">
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">
                        {selectedMeetingForShare.screenshots?.length || 0}
                      </div>
                      <div className="text-xs text-gray-600">Screenshots</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No meeting selected</p>
              </div>
            )}
          </div>
        </div>
      </DialogComponent>