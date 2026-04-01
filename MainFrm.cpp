// MainFrm.cpp : implementation of the CMainFrame class
//

#include "stdafx.h"
#include "BoardSpeedySnake.h"
#include "BoardSpeedySnakeDoc.h"

#include "MainFrm.h"
#include "StatusControl.h"
#include "StatusStatic.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#undef THIS_FILE
static char THIS_FILE[] = __FILE__;
#endif

/////////////////////////////////////////////////////////////////////////////
// CMainFrame

IMPLEMENT_DYNCREATE(CMainFrame, CFrameWnd)

BEGIN_MESSAGE_MAP(CMainFrame, CFrameWnd)
	//{{AFX_MSG_MAP(CMainFrame)
	ON_WM_CREATE()
	ON_COMMAND(ID_VIEW_STATUS_BAR, OnViewStatusBar)
	ON_UPDATE_COMMAND_UI(ID_VIEW_STATUS_BAR, OnUpdateViewStatusBar)
	ON_WM_SIZE()
	//}}AFX_MSG_MAP
END_MESSAGE_MAP()

static UINT indicators[] =
{
	ID_SEPARATOR,           // status line indicator
	ID_SEPARATOR,           // status line indicator
	ID_SEPARATOR,           // status line indicator
	ID_SEPARATOR,           // status line indicator
	ID_INDICATOR_ICON       // status Flower

//	ID_INDICATOR_CAPS,
//	ID_INDICATOR_NUM,
//	ID_INDICATOR_SCRL,
};

/////////////////////////////////////////////////////////////////////////////
// CMainFrame construction/destruction

CMainFrame::CMainFrame()
{
	// TODO: add member initialization code here
	
}

CMainFrame::~CMainFrame()
{

}

int CMainFrame::OnCreate(LPCREATESTRUCT lpCreateStruct)
{

	if (CFrameWnd::OnCreate(lpCreateStruct) == -1)
		return -1;

	// Init New Indicator.
	if (!m_wndStatusBar.Create(this,
		WS_CHILD | WS_VISIBLE | CBRS_BOTTOM,ID_STATUSBAR_GAME) ||
		!m_wndStatusBar.SetIndicators(indicators,
		  sizeof(indicators)/sizeof(UINT)))
	{
		TRACE0("Failed to create status bar\n");
		return -1;      // fail to create
	}

	m_wndStatusBar.SetPaneInfo(0,0,0,50);
	m_wndStatusBar.SetPaneInfo(1,0,0,60);
	m_wndStatusBar.SetPaneInfo(2,0,0,50);
	m_wndStatusBar.SetPaneInfo(3,0,SBPS_STRETCH,80);

	return 0;
}

BOOL CMainFrame::PreCreateWindow(CREATESTRUCT& cs)
{
	if( !CFrameWnd::PreCreateWindow(cs) )
		return FALSE;
	// TODO: Modify the Window class or styles here by modifying
	//  the CREATESTRUCT cs

	// Init Window To Maximize.

	cs.cx = WIDTHSCREEN;
	cs.cy = HEIGHTSCREEN;
	cs.style = WS_MAXIMIZEBOX;
	
	if (cs.style != NULL)
	{
		TRACE0("create window Maximize \n");
		return CFrameWnd::PreCreateWindow(cs);
	}
	else
	{
		TRACE0("failed to create window Maximize \n");
		return FALSE;
	}

}

/////////////////////////////////////////////////////////////////////////////
// CMainFrame diagnostics

#ifdef _DEBUG
void CMainFrame::AssertValid() const
{
	CFrameWnd::AssertValid();
}

void CMainFrame::Dump(CDumpContext& dc) const
{
	CFrameWnd::Dump(dc);
}

#endif //_DEBUG

/////////////////////////////////////////////////////////////////////////////
// CMainFrame message handlers


void CMainFrame::OnViewStatusBar() 
{
	// TODO: Add your command handler code here
	m_wndStatusBar.ShowWindow((m_wndStatusBar.GetStyle() &
							   WS_VISIBLE) == 0);

	RecalcLayout();
	
}

void CMainFrame::OnUpdateViewStatusBar(CCmdUI* pCmdUI) 
{
	// TODO: Add your command update UI handler code here
	pCmdUI->SetCheck((m_wndStatusBar.GetStyle() &
							   WS_VISIBLE) != 0);	
}

void CMainFrame::OnSize(UINT nType, int cx, int cy) 
{
	CFrameWnd::OnSize(nType, cx, cy);
	
	// TODO: Add your message handler code here
	c_StatusIcon.Reposition();
}
