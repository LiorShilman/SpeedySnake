// BoardSpeedySnakeView.cpp : implementation of the CBoardSpeedySnakeView class
//

#include "stdafx.h"
#include <stdlib.h>
#include <stdio.h>
#include <time.h>
#include "MainFrm.h"
#include "AllLavel.h"
#include <mmsystem.h>


#include "BoardSpeedySnake.h"

#include "BoardSpeedySnakeDoc.h"
#include "BoardSpeedySnakeView.h"
#include "res/BoardSpeedySnake.rc2"

extern CBoardSpeedySnakeApp theApp;

#ifdef _DEBUG
#define new DEBUG_NEW
#undef THIS_FILE
static char THIS_FILE[] = __FILE__;
#endif

/////////////////////////////////////////////////////////////////////////////
// CBoardSpeedySnakeView

IMPLEMENT_DYNCREATE(CBoardSpeedySnakeView, CScrollView)

BEGIN_MESSAGE_MAP(CBoardSpeedySnakeView, CScrollView)
	//{{AFX_MSG_MAP(CBoardSpeedySnakeView)
	ON_WM_PAINT()
	ON_WM_KEYDOWN()
	ON_WM_TIMER()
	ON_COMMAND(ID_FILE_NEW_GAME, OnFileNewGame)
	ON_WM_KEYUP()
	ON_COMMAND(ID_FILE_SAVE, OnFileSaveGame)
	ON_COMMAND(ID_FILE_OPEN, OnFileOpenSaveGame)
	ON_COMMAND(ID_FILE_HIGHSCORE, OnLoadHighscore)
	//}}AFX_MSG_MAP
END_MESSAGE_MAP()

/////////////////////////////////////////////////////////////////////////////
// CBoardSpeedySnakeView construction/destruction

CBoardSpeedySnakeView::CBoardSpeedySnakeView():InGame     (FALSE),
											   AfterKeyUp (TRUE),
											   AfterCtrlUp(TRUE)
{
	// TODO: add construction code here

	m_pbBoard   = new CBitmap;
	m_pdcMemory = new CDC;
	hLightBlue  = (HBRUSH)CreateSolidBrush(LIGHT_BLUE_BRUSH);

//	m_cWavFire        = "wav/Sound2.wav";
//	DirectSoundCreate(NULL, &g_lpDS, NULL);
//    g_lpDS->SetCooperativeLevel(*AfxGetMainWnd(), DSSCL_NORMAL);
//	DS_Init();
}

CBoardSpeedySnakeView::~CBoardSpeedySnakeView()
{
//	DS_Finish();
	delete m_pbBoard;
	delete m_pdcMemory;

}

BOOL CBoardSpeedySnakeView::PreCreateWindow(CREATESTRUCT& cs)
{
	// TODO: Modify the Window class or styles here by modifying
	//  the CREATESTRUCT cs

	return CScrollView::PreCreateWindow(cs);
}

/////////////////////////////////////////////////////////////////////////////
// CBoardSpeedySnakeView drawing

void CBoardSpeedySnakeView::OnDraw(CDC* pDC)
{
	CString str;

	CBoardSpeedySnakeDoc* pDoc = GetDocument();
	CMainFrame* pFrame = (CMainFrame*)AfxGetApp()->m_pMainWnd;
	CStatusBar* pStatus = &pFrame->m_wndStatusBar;
	CStatusStatic* pStatic = &pFrame->c_StatusIcon;

	ASSERT_VALID(pDoc);
	// TODO: add draw code for native data here

	CPoint point (0,0);
	pDC->LPtoDP(&point);

	if (InGame)
	{
		// Init Board Game.
		for (int Row = 0; Row < HEIGHTBOARD; Row++)
			for (int Col = 0; Col < WIDTHBOARD; Col++)
			{
				if (pDoc->m_nGameBoard[Row][Col] == pDoc->m_stDirectGame.m_DUVDEVAN)
				{
					pDoc->m_stItemInGame.m_pDuvdevan.x = OFFSET * Col;
					pDoc->m_stItemInGame.m_pDuvdevan.y = OFFSET * Row;
					DrawIconEx(pDC->m_hDC,
							   pDoc->m_stItemInGame.m_pDuvdevan.x,
							   pDoc->m_stItemInGame.m_pDuvdevan.y,
							   pDoc->m_stHiconInGame.m_HDuvdevan,
							   10,10,
							   NULL,NULL,DI_NORMAL);

				}
				else if (pDoc->m_nGameBoard[Row][Col] == pDoc->m_stDirectGame.m_FIRE)
				{
					pDoc->m_stItemInGame.m_pFire.x = OFFSET * Col;
					pDoc->m_stItemInGame.m_pFire.y = OFFSET * Row;
					DrawIconEx(pDC->m_hDC,
							   pDoc->m_stItemInGame.m_pFire.x,
							   pDoc->m_stItemInGame.m_pFire.y,
							   pDoc->m_stHiconInGame.m_HFire,
							   10,10,
							   NULL,NULL,DI_NORMAL);
				} 
				else if (pDoc->m_nGameBoard[Row][Col] == pDoc->m_stDirectGame.m_BLANK)
					{
						pDoc->Rect.left    = OFFSET * Col;
						pDoc->Rect.top     = OFFSET * Row;
						pDoc->Rect.right   = OFFSET * Col + OFFSET;
						pDoc->Rect.bottom  = OFFSET * Row + OFFSET;

						FillRect( pDC->m_hDC, &pDoc->Rect, (HBRUSH)GetStockObject(WHITE_BRUSH)); 
					}
					else if (pDoc->m_nGameBoard[Row][Col] == pDoc->m_stDirectGame.m_WALL)
						{
							pDoc->Rect.left    = OFFSET * Col;
							pDoc->Rect.top     = OFFSET * Row;
							pDoc->Rect.right   = OFFSET * Col + OFFSET;
							pDoc->Rect.bottom  = OFFSET * Row + OFFSET;

							FillRect( pDC->m_hDC, &pDoc->Rect, hLightBlue); 
						} 
						else if (pDoc->m_nGameBoard[Row][Col] == pDoc->m_stDirectGame.m_UP    ||
								 pDoc->m_nGameBoard[Row][Col] == pDoc->m_stDirectGame.m_DOWN  ||
								 pDoc->m_nGameBoard[Row][Col] == pDoc->m_stDirectGame.m_LEFT  ||
								 pDoc->m_nGameBoard[Row][Col] == pDoc->m_stDirectGame.m_RIGHT   )
						{
							pDoc->m_stItemInGame.m_pSnake.x = OFFSET * Col;
							pDoc->m_stItemInGame.m_pSnake.y = OFFSET * Row;
							DrawIconEx(pDC->m_hDC,
							   pDoc->m_stItemInGame.m_pSnake.x,
							   pDoc->m_stItemInGame.m_pSnake.y,
							   pDoc->m_stHiconInGame.m_HSnake,
							   10,10,
							   NULL,NULL,DI_NORMAL);

						}
						else;

				}

			// Init Head Snake.
			if (pDoc->m_nGameBoard[pDoc->m_stHeadPosition.Curr.y][pDoc->m_stHeadPosition.Curr.x] == pDoc->m_stDirectGame.m_RIGHT)
			{
				pDoc->m_stItemInGame.m_pSnakeHead.x = OFFSET * pDoc->m_stHeadPosition.Curr.x;
				pDoc->m_stItemInGame.m_pSnakeHead.y = OFFSET * pDoc->m_stHeadPosition.Curr.y;
				DrawIconEx(pDC->m_hDC,
						   pDoc->m_stItemInGame.m_pSnakeHead.x,
						   pDoc->m_stItemInGame.m_pSnakeHead.y,
						   pDoc->m_stHiconInGame.m_HheadRight,
						   10,10,
						   NULL,NULL,DI_NORMAL);
			}
			else if (pDoc->m_nGameBoard[pDoc->m_stHeadPosition.Curr.y][pDoc->m_stHeadPosition.Curr.x] == pDoc->m_stDirectGame.m_LEFT)
				{
					pDoc->m_stItemInGame.m_pSnakeHead.x = OFFSET * pDoc->m_stHeadPosition.Curr.x;
					pDoc->m_stItemInGame.m_pSnakeHead.y = OFFSET * pDoc->m_stHeadPosition.Curr.y;
					DrawIconEx(pDC->m_hDC,
						   pDoc->m_stItemInGame.m_pSnakeHead.x,
						   pDoc->m_stItemInGame.m_pSnakeHead.y,
						   pDoc->m_stHiconInGame.m_HheadLeft,
						   10,10,
						   NULL,NULL,DI_NORMAL);
				}
				else if (pDoc->m_nGameBoard[pDoc->m_stHeadPosition.Curr.y][pDoc->m_stHeadPosition.Curr.x] == pDoc->m_stDirectGame.m_UP)
					{
						pDoc->m_stItemInGame.m_pSnakeHead.x = OFFSET * pDoc->m_stHeadPosition.Curr.x;
						pDoc->m_stItemInGame.m_pSnakeHead.y = OFFSET * pDoc->m_stHeadPosition.Curr.y;
						DrawIconEx(pDC->m_hDC,
						   pDoc->m_stItemInGame.m_pSnakeHead.x,
						   pDoc->m_stItemInGame.m_pSnakeHead.y,
						   pDoc->m_stHiconInGame.m_HheadUp,
						   10,10,
						   NULL,NULL,DI_NORMAL);
					}
					else if (pDoc->m_nGameBoard[pDoc->m_stHeadPosition.Curr.y][pDoc->m_stHeadPosition.Curr.x] == pDoc->m_stDirectGame.m_DOWN)
						{
							pDoc->m_stItemInGame.m_pSnakeHead.x = OFFSET * pDoc->m_stHeadPosition.Curr.x;
							pDoc->m_stItemInGame.m_pSnakeHead.y = OFFSET * pDoc->m_stHeadPosition.Curr.y;
							DrawIconEx(pDC->m_hDC,
						    pDoc->m_stItemInGame.m_pSnakeHead.x,
						    pDoc->m_stItemInGame.m_pSnakeHead.y,
						    pDoc->m_stHiconInGame.m_HheadDown,
						    10,10,
						    NULL,NULL,DI_NORMAL);
						}
						else;

	}

	// Init Status Bar From Information Game.


	if (pStatus)
	{
		str.Format("Lavel - %d",pDoc->m_nLavel);
		pStatus->SetPaneText(0,str);
		
		str.Format("Score - %d",pDoc->m_nScore);
		pStatus->SetPaneText(1,str);

		str.Format("Speed - %d",pDoc->m_nSpeed);
		pStatus->SetPaneText(2,str);
		
		str.Format("%d - More Duvdevan",(pDoc->m_nMaxDuvdevanInLavel - pDoc->m_nNumberDuvdevan));
		pStatus->SetPaneText(3,str);

	}

	if (pDoc->NewLavel)
	{
 		pDoc->m_nNumberDuvdevan = 0;
		KillTimer(TIMER_IN_GAME);
		AfxMessageBox("Next Lavel",MB_OK);

		InitLavel();

		SetGameTimer(pDoc->m_nSpeed);

		pDoc->NewLavel = FALSE;
		pDoc->RandomWall();
    }
}

void CBoardSpeedySnakeView::OnInitialUpdate()
{
	CScrollView::OnInitialUpdate();

	CSize sizeTotal;
	// TODO: calculate the total size of this view
	sizeTotal.cx = sizeTotal.cy = 100;
	SetScrollSizes(MM_TEXT, sizeTotal);

	if (m_pdcMemory->GetSafeHdc() == NULL)
	{
		CClientDC dc(this);
		OnPrepareDC(&dc);
		CRect RectMax(0,0,WIDTHSCREEN,HEIGHTSCREEN);
		m_pdcMemory->CreateCompatibleDC(&dc);
		m_pbBoard->CreateCompatibleBitmap (&dc,RectMax.right,RectMax.bottom);
//		m_pbToDraw->CreateCompatibleBitmap(&dc,RectMax.right,RectMax.bottom);
		m_pdcMemory->SetMapMode(MM_TEXT);
	}	

}

/////////////////////////////////////////////////////////////////////////////
// CBoardSpeedySnakeView diagnostics

#ifdef _DEBUG
void CBoardSpeedySnakeView::AssertValid() const
{
	CScrollView::AssertValid();
}

void CBoardSpeedySnakeView::Dump(CDumpContext& dc) const
{
	CScrollView::Dump(dc);
}

CBoardSpeedySnakeDoc* CBoardSpeedySnakeView::GetDocument() // non-debug version is inline
{
	ASSERT(m_pDocument->IsKindOf(RUNTIME_CLASS(CBoardSpeedySnakeDoc)));
	return (CBoardSpeedySnakeDoc*)m_pDocument;
}
#endif //_DEBUG

/////////////////////////////////////////////////////////////////////////////
// CBoardSpeedySnakeView message handlers

void CBoardSpeedySnakeView::InitLavel()
{
	 int Row;
	 int Col;
	 int i;

	 HRSRC hRes; // resource handle to wave file
	 HGLOBAL hData;
	 BOOL bOk = FALSE;

	 CBoardSpeedySnakeDoc* pDoc = GetDocument();

	 switch (pDoc->m_nLavel)
	 {
		case 1:
			sndPlaySound(NULL,SND_SYNC);
			if ((hRes = ::FindResource(AfxGetResourceHandle(), MAKEINTRESOURCE(DS_LEVEL_1),
			  _T("sound"))) != NULL &&
			  (hData = ::LoadResource(AfxGetResourceHandle(), hRes)) != NULL)
			{
				// found the resource, play it
				bOk = sndPlaySound((LPCTSTR)::LockResource(hData),
					SND_MEMORY |SND_ASYNC|SND_NODEFAULT);
				FreeResource(hData);
			}

			for (i = 0 ; i < MAX_PAUSE; i ++);

			 pDoc->m_stHeadPosition.Curr = Lavel1Info.Head;
			 pDoc->m_stTailPosition.Curr = Lavel1Info.Tail;
			 pDoc->m_nDirection			 = Lavel1Info.Direction;
			 pDoc->m_nMaxDuvdevanInLavel  	 = Lavel1Info.MaxDuvdevanInLavel;
			 pDoc->m_nScoreForOneDuvdevan 	 = Lavel1Info.ScoreForOneDuvdevan;
			 pDoc->m_nNumberDuvdevanToFire  = Lavel1Info.NumberDuvdevanToFire;


		     for ( Row = 0; Row < HEIGHTBOARD ; Row++)
				   for ( Col = 0; Col < WIDTHBOARD ; Col++)
					{
						switch (Lavel1[Row][Col])
						{
							case 0:
								pDoc->m_nGameBoard[Row][Col] = pDoc->m_stDirectGame.m_BLANK;
								break;
							case 1:
								pDoc->m_nGameBoard[Row][Col] = pDoc->m_stDirectGame.m_WALL;
								break;
							case 8:
								pDoc->m_nGameBoard[Row][Col] = pDoc->m_stDirectGame.m_UP;
								break;
							case 2:
								pDoc->m_nGameBoard[Row][Col] = pDoc->m_stDirectGame.m_DOWN;
								break;
							case 6:
								pDoc->m_nGameBoard[Row][Col] = pDoc->m_stDirectGame.m_RIGHT;
								break;
							case 4:
								pDoc->m_nGameBoard[Row][Col] = pDoc->m_stDirectGame.m_LEFT;
								break;
						}
					}
			  break;
		case 2:
			sndPlaySound(NULL,SND_SYNC);
			if ((hRes = ::FindResource(AfxGetResourceHandle(), MAKEINTRESOURCE(DS_LEVEL_2),
			  _T("sound"))) != NULL &&
			  (hData = ::LoadResource(AfxGetResourceHandle(), hRes)) != NULL)
			{
				// found the resource, play it
				bOk = sndPlaySound((LPCTSTR)::LockResource(hData),
					SND_MEMORY |SND_ASYNC|SND_NODEFAULT);
				FreeResource(hData);
			}

			for (i = 0 ; i < MAX_PAUSE; i ++);

			 pDoc->m_stHeadPosition.Curr = Lavel2Info.Head;
			 pDoc->m_stTailPosition.Curr = Lavel2Info.Tail;
			 pDoc->m_nDirection			 = Lavel2Info.Direction;
			 pDoc->m_nMaxDuvdevanInLavel  	 = Lavel2Info.MaxDuvdevanInLavel;
			 pDoc->m_nScoreForOneDuvdevan 	 = Lavel2Info.ScoreForOneDuvdevan;
			 pDoc->m_nNumberDuvdevanToFire  = Lavel2Info.NumberDuvdevanToFire;


		     for ( Row = 0; Row < HEIGHTBOARD ; Row++)
				   for ( Col = 0; Col < WIDTHBOARD ; Col++)
					{
						switch (Lavel2[Row][Col])
						{
							case 0:
								pDoc->m_nGameBoard[Row][Col] = pDoc->m_stDirectGame.m_BLANK;
								break;
							case 1:
								pDoc->m_nGameBoard[Row][Col] = pDoc->m_stDirectGame.m_WALL;
								break;
							case 8:
								pDoc->m_nGameBoard[Row][Col] = pDoc->m_stDirectGame.m_UP;
								break;
							case 2:
								pDoc->m_nGameBoard[Row][Col] = pDoc->m_stDirectGame.m_DOWN;
								break;
							case 6:
								pDoc->m_nGameBoard[Row][Col] = pDoc->m_stDirectGame.m_RIGHT;
								break;
							case 4:
								pDoc->m_nGameBoard[Row][Col] = pDoc->m_stDirectGame.m_LEFT;
								break;
						}
					}
			  break;
		case 3:
			sndPlaySound(NULL,SND_SYNC);
			if ((hRes = ::FindResource(AfxGetResourceHandle(), MAKEINTRESOURCE(DS_LEVEL_3),
			  _T("sound"))) != NULL &&
			  (hData = ::LoadResource(AfxGetResourceHandle(), hRes)) != NULL)
			{
				// found the resource, play it
				bOk = sndPlaySound((LPCTSTR)::LockResource(hData),
					SND_MEMORY |SND_ASYNC|SND_NODEFAULT);
				FreeResource(hData);
			}

			for (i = 0 ; i < MAX_PAUSE; i ++);


			 pDoc->m_stHeadPosition.Curr = Lavel3Info.Head;
			 pDoc->m_stTailPosition.Curr = Lavel3Info.Tail;
			 pDoc->m_nDirection			 = Lavel3Info.Direction;
			 pDoc->m_nMaxDuvdevanInLavel  	 = Lavel3Info.MaxDuvdevanInLavel;
			 pDoc->m_nScoreForOneDuvdevan 	 = Lavel3Info.ScoreForOneDuvdevan;
			 pDoc->m_nNumberDuvdevanToFire  = Lavel3Info.NumberDuvdevanToFire;


		     for ( Row = 0; Row < HEIGHTBOARD ; Row++)
				   for ( Col = 0; Col < WIDTHBOARD ; Col++)
					{
						switch (Lavel3[Row][Col])
						{
							case 0:
								pDoc->m_nGameBoard[Row][Col] = pDoc->m_stDirectGame.m_BLANK;
								break;
							case 1:
								pDoc->m_nGameBoard[Row][Col] = pDoc->m_stDirectGame.m_WALL;
								break;
							case 8:
								pDoc->m_nGameBoard[Row][Col] = pDoc->m_stDirectGame.m_UP;
								break;
							case 2:
								pDoc->m_nGameBoard[Row][Col] = pDoc->m_stDirectGame.m_DOWN;
								break;
							case 6:
								pDoc->m_nGameBoard[Row][Col] = pDoc->m_stDirectGame.m_RIGHT;
								break;
							case 4:
								pDoc->m_nGameBoard[Row][Col] = pDoc->m_stDirectGame.m_LEFT;
								break;
						}
					}
			  break;
		case 4:
			sndPlaySound(NULL,SND_SYNC);
			if ((hRes = ::FindResource(AfxGetResourceHandle(), MAKEINTRESOURCE(DS_LEVEL_4),
			  _T("sound"))) != NULL &&
			  (hData = ::LoadResource(AfxGetResourceHandle(), hRes)) != NULL)
			{
				// found the resource, play it
				bOk = sndPlaySound((LPCTSTR)::LockResource(hData),
					SND_MEMORY |SND_ASYNC|SND_NODEFAULT);
				FreeResource(hData);
			}

			for (i = 0 ; i < MAX_PAUSE; i ++);


			 pDoc->m_stHeadPosition.Curr = Lavel4Info.Head;
			 pDoc->m_stTailPosition.Curr = Lavel4Info.Tail;
			 pDoc->m_nDirection			 = Lavel4Info.Direction;
			 pDoc->m_nMaxDuvdevanInLavel  	 = Lavel4Info.MaxDuvdevanInLavel;
			 pDoc->m_nScoreForOneDuvdevan 	 = Lavel4Info.ScoreForOneDuvdevan;
			 pDoc->m_nNumberDuvdevanToFire  = Lavel4Info.NumberDuvdevanToFire;


		     for ( Row = 0; Row < HEIGHTBOARD ; Row++)
				   for ( Col = 0; Col < WIDTHBOARD ; Col++)
					{
						switch (Lavel4[Row][Col])
						{
							case 0:
								pDoc->m_nGameBoard[Row][Col] = pDoc->m_stDirectGame.m_BLANK;
								break;
							case 1:
								pDoc->m_nGameBoard[Row][Col] = pDoc->m_stDirectGame.m_WALL;
								break;
							case 8:
								pDoc->m_nGameBoard[Row][Col] = pDoc->m_stDirectGame.m_UP;
								break;
							case 2:
								pDoc->m_nGameBoard[Row][Col] = pDoc->m_stDirectGame.m_DOWN;
								break;
							case 6:
								pDoc->m_nGameBoard[Row][Col] = pDoc->m_stDirectGame.m_RIGHT;
								break;
							case 4:
								pDoc->m_nGameBoard[Row][Col] = pDoc->m_stDirectGame.m_LEFT;
								break;
						}
					}
			  break;
		case 5:
			sndPlaySound(NULL,SND_SYNC);
			if ((hRes = ::FindResource(AfxGetResourceHandle(), MAKEINTRESOURCE(DS_LEVEL_5),
			  _T("sound"))) != NULL &&
			  (hData = ::LoadResource(AfxGetResourceHandle(), hRes)) != NULL)
			{
				// found the resource, play it
				bOk = sndPlaySound((LPCTSTR)::LockResource(hData),
					SND_MEMORY |SND_ASYNC|SND_NODEFAULT);
				FreeResource(hData);
			}

			for (i = 0 ; i < MAX_PAUSE; i ++);


			 pDoc->m_stHeadPosition.Curr = Lavel5Info.Head;
			 pDoc->m_stTailPosition.Curr = Lavel5Info.Tail;
			 pDoc->m_nDirection			 = Lavel5Info.Direction;
			 pDoc->m_nMaxDuvdevanInLavel  	 = Lavel5Info.MaxDuvdevanInLavel;
			 pDoc->m_nScoreForOneDuvdevan 	 = Lavel5Info.ScoreForOneDuvdevan;
			 pDoc->m_nNumberDuvdevanToFire  = Lavel5Info.NumberDuvdevanToFire;


		     for ( Row = 0; Row < HEIGHTBOARD ; Row++)
				   for ( Col = 0; Col < WIDTHBOARD ; Col++)
					{
						switch (Lavel5[Row][Col])
						{
							case 0:
								pDoc->m_nGameBoard[Row][Col] = pDoc->m_stDirectGame.m_BLANK;
								break;
							case 1:
								pDoc->m_nGameBoard[Row][Col] = pDoc->m_stDirectGame.m_WALL;
								break;
							case 8:
								pDoc->m_nGameBoard[Row][Col] = pDoc->m_stDirectGame.m_UP;
								break;
							case 2:
								pDoc->m_nGameBoard[Row][Col] = pDoc->m_stDirectGame.m_DOWN;
								break;
							case 6:
								pDoc->m_nGameBoard[Row][Col] = pDoc->m_stDirectGame.m_RIGHT;
								break;
							case 4:
								pDoc->m_nGameBoard[Row][Col] = pDoc->m_stDirectGame.m_LEFT;
								break;
						}
					}
			  break;
		case 6:
			 pDoc->m_stHeadPosition.Curr = Lavel6Info.Head;
			 pDoc->m_stTailPosition.Curr = Lavel6Info.Tail;
			 pDoc->m_nDirection			 = Lavel6Info.Direction;
			 pDoc->m_nMaxDuvdevanInLavel  	 = Lavel6Info.MaxDuvdevanInLavel;
			 pDoc->m_nScoreForOneDuvdevan 	 = Lavel6Info.ScoreForOneDuvdevan;
			 pDoc->m_nNumberDuvdevanToFire  = Lavel6Info.NumberDuvdevanToFire;


		     for ( Row = 0; Row < HEIGHTBOARD ; Row++)
				   for ( Col = 0; Col < WIDTHBOARD ; Col++)
					{
						switch (Lavel6[Row][Col])
						{
							case 0:
								pDoc->m_nGameBoard[Row][Col] = pDoc->m_stDirectGame.m_BLANK;
								break;
							case 1:
								pDoc->m_nGameBoard[Row][Col] = pDoc->m_stDirectGame.m_WALL;
								break;
							case 8:
								pDoc->m_nGameBoard[Row][Col] = pDoc->m_stDirectGame.m_UP;
								break;
							case 2:
								pDoc->m_nGameBoard[Row][Col] = pDoc->m_stDirectGame.m_DOWN;
								break;
							case 6:
								pDoc->m_nGameBoard[Row][Col] = pDoc->m_stDirectGame.m_RIGHT;
								break;
							case 4:
								pDoc->m_nGameBoard[Row][Col] = pDoc->m_stDirectGame.m_LEFT;
								break;
						}
					}
			  break;
	 }

	 pDoc->ThereIsFire = FALSE;

	 
	 // Init New Lavel Game.
/*	 switch (pDoc->m_nLavel)
	 {
		case 0:
			InitBoard(Lavel0,Lavel0Info);
			break;
		case 1:
			InitBoard(Lavel1,Lavel1Info);
			break;
		case 2:
			InitBoard(Lavel2,Lavel2Info);
			break;
		case 3:
			InitBoard(Lavel3,Lavel3Info);
			break;
		case 4:
			InitBoard(Lavel4,Lavel4Info);
			break;
		case 5:
			InitBoard(Lavel5,Lavel5Info);
			break;
		case 6:
			InitBoard(Lavel6,Lavel6Info);
			break;
	 }

//		delete TempInfo;
//	    delete []TempLavel;



/*	switch (pDoc->m_nLavel)
	{
		case 0:
			InitOneLavel("LAVEL0");
			break;
		case 1:			
			InitOneLavel("LAVEL1");
			break;
		case 2:
			InitOneLavel("LAVEL2");
			break;
		case 3:
			InitOneLavel("LAVEL3");
			break;
		case 4:
			InitOneLavel("LAVEL4");
			break;
		case 5:
			InitOneLavel("LAVEL5");
			break;
		case 6:
			InitOneLavel("LAVEL6");
			break;
	}
*/
}

void CBoardSpeedySnakeView::InitOneLavel(CString Lavel)
{
/*	 FILE * InitLavel;
	 CString Str;
	 int    Number;

	 CBoardSpeedySnakeDoc* pDoc = GetDocument();

     if( (InitLavel  = fopen( "InitAllLavel.txt", "r" )) != NULL )
     {
		 fgets(Str.GetBuffer(MAXLINE),MAXLINE,InitLavel);
		 Str.SetAt(6,'\0');
		 while( strcmp(Str,Lavel) != 0)
		 {
			 fgets(Str.GetBuffer(MAXLINE),80,InitLavel);
			 Str.ReleaseBuffer();
			 Str.SetAt(6,'\0');
		 }

	 FILE * InitLavel;
	 char   ThisLavel[7];
	 char   Str[80];
	 int    Number;

	 CBoardSpeedySnakeDoc* pDoc = GetDocument();

	 Str[0] = '\0';
	 strncpy(ThisLavel,Lavel,6);
	 ThisLavel[6] = '\0';

     if( (InitLavel  = fopen( "InitAllLavel.txt", "r" )) != NULL )
     {
		 fgets(Str,80,InitLavel);
		 Str[6] = '\0';
		 while( strcmp(Str,ThisLavel) != 0)
		 {
			 fgets(Str,80,InitLavel);
			 Str[6] = '\0';

		 }
		 
		 fscanf(InitLavel,"%d",&pDoc->m_stHeadPosition.Curr.x);
		 fscanf(InitLavel,"%d",&pDoc->m_stHeadPosition.Curr.y);
		 fscanf(InitLavel,"%d",&pDoc->m_stTailPosition.Curr.x);
		 fscanf(InitLavel,"%d",&pDoc->m_stTailPosition.Curr.y);
		 fscanf(InitLavel,"%d",&pDoc->m_nDirection.x);
		 fscanf(InitLavel,"%d",&pDoc->m_nDirection.y);
		 fscanf(InitLavel,"%d",&pDoc->m_nMaxDuvdevanInLavel);
		 fscanf(InitLavel,"%d",&pDoc->m_nScoreForOneDuvdevan);
		 fscanf(InitLavel,"%d",&pDoc->m_nNumberDuvdevanToFire);

   		 for (int Row = 0; Row < HEIGHTBOARD; Row++)
			for (int Col = 0; Col < WIDTHBOARD; Col++)
			{
				fscanf(InitLavel,"%d",&Number);

				switch (Number)
				{
					case 0:
						pDoc->m_nGameBoard[Row][Col] = pDoc->m_stDirectGame.m_BLANK;
						break;
					case 1:
						pDoc->m_nGameBoard[Row][Col] = pDoc->m_stDirectGame.m_WALL;
						break;
					case 8:
						pDoc->m_nGameBoard[Row][Col] = pDoc->m_stDirectGame.m_UP;
						break;
					case 2:
						pDoc->m_nGameBoard[Row][Col] = pDoc->m_stDirectGame.m_DOWN;
						break;
					case 6:
						pDoc->m_nGameBoard[Row][Col] = pDoc->m_stDirectGame.m_RIGHT;
						break;
					case 4:
						pDoc->m_nGameBoard[Row][Col] = pDoc->m_stDirectGame.m_LEFT;
						break;

				}
			}

		 fclose( InitLavel);     
	 }
*/
}

void CBoardSpeedySnakeView::OnPaint() 
{
	
	// TODO: Add your message handler code here
	CPaintDC dc(this); // device context for painting
	OnPrepareDC(&dc);
	CRect rectUpdate;
	dc.GetClipBox(&rectUpdate);
	CBitmap * pOldBitmap = m_pdcMemory->SelectObject(m_pbBoard);
	m_pdcMemory->SelectClipRgn(NULL);
	m_pdcMemory->IntersectClipRect(&rectUpdate);

	m_pdcMemory->PatBlt(rectUpdate.left,rectUpdate.top,
						rectUpdate.Width(),rectUpdate.Height(),PATCOPY);
	OnDraw(m_pdcMemory);

	dc.BitBlt(rectUpdate.left,rectUpdate.top,
						rectUpdate.Width(),rectUpdate.Height(),m_pdcMemory,
						rectUpdate.left,rectUpdate.top,
						SRCCOPY);


	m_pdcMemory->SelectObject(pOldBitmap);


	// Do not call CScrollView::OnPaint() for painting messages
}

void CBoardSpeedySnakeView::OnKeyDown(UINT nChar, UINT nRepCnt, UINT nFlags) 
{
	HRSRC hRes; // resource handle to wave file
	HGLOBAL hData;
	BOOL bOk = FALSE;
	// TODO: Add your message handler code here and/or call default

	CMainFrame* pFrame = (CMainFrame*)AfxGetApp()->m_pMainWnd;
	CStatusBar* pStatus = &pFrame->m_wndStatusBar;
	CBoardSpeedySnakeDoc* pDoc = GetDocument();

	switch (nChar) 
	{         
		case VK_NUMPAD4: 
		case VK_LEFT:
			if ((pDoc->m_nDirection != pDoc->m_stDirectGame.m_LEFT) &&
				(pDoc->m_nDirection != pDoc->m_stDirectGame.m_RIGHT))
			{
				KillTimer(TIMER_IN_GAME);
				pDoc->m_nDirection = pDoc->m_stDirectGame.m_LEFT;
				InitMoveInBoard(pDoc->m_nDirection);
				AfterKeyUp = FALSE;
				SetGameTimer(pDoc->m_nSpeed);
			}
			break;         
		case VK_NUMPAD6: 
		case VK_RIGHT: 
			if ((pDoc->m_nDirection != pDoc->m_stDirectGame.m_RIGHT) &&
				(pDoc->m_nDirection != pDoc->m_stDirectGame.m_LEFT))
			{
				KillTimer(TIMER_IN_GAME);
				pDoc->m_nDirection = pDoc->m_stDirectGame.m_RIGHT;
				InitMoveInBoard(pDoc->m_nDirection);
				AfterKeyUp = FALSE;
				SetGameTimer(pDoc->m_nSpeed);
			}
			break;         
		case VK_NUMPAD8: 
	    case VK_UP: 
			if ((pDoc->m_nDirection != pDoc->m_stDirectGame.m_UP) &&
				(pDoc->m_nDirection != pDoc->m_stDirectGame.m_DOWN))
			{
				KillTimer(TIMER_IN_GAME);
				pDoc->m_nDirection = pDoc->m_stDirectGame.m_UP;
				InitMoveInBoard(pDoc->m_nDirection);
				AfterKeyUp = FALSE;
				SetGameTimer(pDoc->m_nSpeed);
			}
			break;         
		case VK_NUMPAD2:
		case VK_DOWN : 
			if ((pDoc->m_nDirection != pDoc->m_stDirectGame.m_DOWN) &&
				(pDoc->m_nDirection != pDoc->m_stDirectGame.m_UP))
			{
				KillTimer(TIMER_IN_GAME);
				pDoc->m_nDirection = pDoc->m_stDirectGame.m_DOWN;
				InitMoveInBoard(pDoc->m_nDirection);
				AfterKeyUp = FALSE;
				SetGameTimer(pDoc->m_nSpeed);
			}
			break;         
		case VK_CONTROL: 
			//	DS_PlaySound(DS_FIRE_SOUND,NULL);

			if (pDoc->EatFire && AfterCtrlUp)
			{
				sndPlaySound(NULL,SND_SYNC);
				if ((hRes = ::FindResource(AfxGetResourceHandle(), MAKEINTRESOURCE(DS_FIRE_SOUND),
				  _T("sound"))) != NULL &&
				  (hData = ::LoadResource(AfxGetResourceHandle(), hRes)) != NULL)
				{
					// found the resource, play it
					bOk = sndPlaySound((LPCTSTR)::LockResource(hData),
						SND_MEMORY |SND_ASYNC|SND_NODEFAULT);
					FreeResource(hData);
				}

				for (int i = 0 ; i < MAX_PAUSE; i ++);

				pDoc->Fire();
				
				pDoc->EatFire = FALSE;
				AfterCtrlUp = FALSE;
			}
			break; 
		case VK_SPACE: 
			int TSpeed = pDoc->m_nSpeed;

			if (InGame && !pDoc->InPause)
				KillTimer(TIMER_IN_GAME);
			else if (InGame && pDoc->InPause)
				SetGameTimer(TSpeed);

				break;
	} 

	CView::OnKeyDown(nChar, nRepCnt, nFlags);
	CScrollView::OnKeyDown(nChar, nRepCnt, nFlags);
}

void CBoardSpeedySnakeView::InitMoveInBoard(CPoint Direction)
{
	CBoardSpeedySnakeDoc* pDoc = GetDocument();

	CPoint TempDirection;

	TempDirection = pDoc->m_stHeadPosition.Curr + Direction;

	if ((TempDirection.x >= 0 && TempDirection.x < WIDTHBOARD) && 
		(TempDirection.y >= 0 && TempDirection.y < HEIGHTBOARD) &&
		(pDoc->m_nGameBoard[TempDirection.y][TempDirection.x] == pDoc->m_stDirectGame.m_BLANK ||
		 pDoc->m_nGameBoard[TempDirection.y][TempDirection.x] == pDoc->m_stDirectGame.m_DUVDEVAN ||
		 pDoc->m_nGameBoard[TempDirection.y][TempDirection.x] == pDoc->m_stDirectGame.m_FIRE ))
	{
		if (pDoc->m_nGameBoard[TempDirection.y][TempDirection.x] == pDoc->m_stDirectGame.m_DUVDEVAN)
		{
			pDoc->m_nGameBoard[pDoc->m_stHeadPosition.Curr.y][pDoc->m_stHeadPosition.Curr.x] = Direction;

			pDoc->m_stHeadPosition.Next = TempDirection;

			pDoc->m_nGameBoard[pDoc->m_stHeadPosition.Next.y][pDoc->m_stHeadPosition.Next.x] = Direction;
			
			pDoc->m_stHeadPosition.Curr = pDoc->m_stHeadPosition.Next;

			pDoc->m_nScore += pDoc->m_nScoreForOneDuvdevan;
			pDoc->m_nNumberDuvdevan += 1;

			if (pDoc->m_nNumberDuvdevan >= pDoc->m_nMaxDuvdevanInLavel)
			{
				pDoc->m_nLavel = ((pDoc->m_nLavel) % 6) + 1;
				pDoc->NewLavel = TRUE;
				if (pDoc->m_nLavel == 1)
					pDoc->m_nSpeed = ((pDoc->m_nSpeed) % 6) + 1;	
			}

			pDoc->EatDuvdevan = TRUE;
			pDoc->RandomWall();

			if ((pDoc->m_nNumberDuvdevan % pDoc->m_nNumberDuvdevanToFire == 0) &&
				(pDoc->ThereIsFire == FALSE)							 &&
				((pDoc->m_nRama != 0) ||
				 (pDoc->m_nRama == 0) && (pDoc->m_nLavel >=3)))
				pDoc->RandomFire();

		}
		else if (pDoc->m_nGameBoard[TempDirection.y][TempDirection.x] == pDoc->m_stDirectGame.m_FIRE)
		{
			pDoc->m_nGameBoard[pDoc->m_stHeadPosition.Curr.y][pDoc->m_stHeadPosition.Curr.x] = Direction;

			pDoc->m_stHeadPosition.Next = TempDirection;

			pDoc->m_nGameBoard[pDoc->m_stHeadPosition.Next.y][pDoc->m_stHeadPosition.Next.x] = Direction;
			
			pDoc->m_stHeadPosition.Curr = pDoc->m_stHeadPosition.Next;

			pDoc->EatFire = TRUE;
			pDoc->ThereIsFire = FALSE;

			pDoc->SetFireOnStatusBar();
		}
		else 
		{
			pDoc->m_nGameBoard[pDoc->m_stHeadPosition.Curr.y][pDoc->m_stHeadPosition.Curr.x] = Direction;

			pDoc->m_stHeadPosition.Next = TempDirection;

			pDoc->m_nGameBoard[pDoc->m_stHeadPosition.Next.y][pDoc->m_stHeadPosition.Next.x] = Direction;
			
			pDoc->m_stHeadPosition.Curr = pDoc->m_stHeadPosition.Next;
		}
	}
	else 
	{
		KillTimer(TIMER_IN_GAME);
		SaveScoreInReg();
		InGame = FALSE;
	}

	if (!pDoc->EatDuvdevan)
	{
		pDoc->m_stTailPosition.Last = pDoc->m_stTailPosition.Curr;
		pDoc->m_stTailPosition.Next = pDoc->m_stTailPosition.Curr + pDoc->m_nGameBoard[pDoc->m_stTailPosition.Curr.y][pDoc->m_stTailPosition.Curr.x];
		pDoc->m_nGameBoard[pDoc->m_stTailPosition.Curr.y][pDoc->m_stTailPosition.Curr.x] = pDoc->m_stDirectGame.m_BLANK;
		pDoc->m_stTailPosition.Curr = pDoc->m_stTailPosition.Next;
	}
	else
		pDoc->EatDuvdevan = FALSE;

	InvalidateRect(NULL,FALSE);
}

void CBoardSpeedySnakeView::OnTimer(UINT nIDEvent) 
{
	// TODO: Add your message handler code here and/or call default
	CBoardSpeedySnakeDoc* pDoc = GetDocument();

	InitMoveInBoard(pDoc->m_nDirection);
	
	CScrollView::OnTimer(nIDEvent);
}

void CBoardSpeedySnakeView::OnFileNewGame() 
{
	// TODO: Add your command handler code here
	DlgGameConfiguration.DoModal();
	CBoardSpeedySnakeDoc* pDoc = GetDocument();

	if (InGame)
		KillTimer(TIMER_IN_GAME);
	else
	{
		pDoc->m_nLavel				= 1;
		pDoc->m_nSpeed				= DlgGameConfiguration.m_nSpeed;
		pDoc->m_nRama				= DlgGameConfiguration.m_nLavel;
		pDoc->m_nNumberDuvdevan		= 0;
		pDoc->m_nScore				= 0;

		InGame = TRUE;
		pDoc->EatDuvdevan = FALSE;
		pDoc->InPause  = FALSE;
		pDoc->EatFire  = FALSE;

		pDoc->SetFireOnStatusBar();

		InitLavel();

		pDoc->RandomWall();

		SetGameTimer(pDoc->m_nSpeed);

		pDoc->ThereIsFire = FALSE;
	}
//	pDoc->m_sndFire.Play(IDR_FIRE_SOUND,TRUE);
}



void CBoardSpeedySnakeView::OnKeyUp(UINT nChar, UINT nRepCnt, UINT nFlags) 
{
	// TODO: Add your message handler code here and/or call default
	CBoardSpeedySnakeDoc* pDoc = GetDocument();
	switch (nChar) 
	{         
		case VK_CONTROL:
			AfterCtrlUp = TRUE;
			break;
		case VK_SPACE: 
			pDoc->InPause = !pDoc->InPause;
			break;
		default:
			AfterKeyUp = TRUE;
			break;
	}

	CScrollView::OnKeyUp(nChar, nRepCnt, nFlags);
}


/*
void CBoardSpeedySnakeView::InitBoard(int TempLavel[HEIGHTBOARD][WIDTHBOARD],INFORLAVEL TempInfo)
{
	CBoardSpeedySnakeDoc* pDoc = GetDocument();

	 pDoc->m_stHeadPosition.Curr = TempInfo.Head;
	 pDoc->m_stTailPosition.Curr = TempInfo.Tail;
	 pDoc->m_nDirection			 = TempInfo.Direction;
	 pDoc->m_nMaxDuvdevanInLavel  	 = TempInfo.MaxDuvdevanInLavel;
	 pDoc->m_nScoreForOneDuvdevan 	 = TempInfo.ScoreForOneDuvdevan;
	 pDoc->m_nNumberDuvdevanToFire  = TempInfo.NumberDuvdevanToFire;


     for (int Row = 0; Row < HEIGHTBOARD ; Row++)
	   for (int Col = 0; Col < WIDTHBOARD ; Col++)
		{
			switch (TempLavel[Row][Col])
			{
				case 0:
					pDoc->m_nGameBoard[Row][Col] = pDoc->m_stDirectGame.m_BLANK;
					break;
				case 1:
					pDoc->m_nGameBoard[Row][Col] = pDoc->m_stDirectGame.m_WALL;
					break;
				case 8:
					pDoc->m_nGameBoard[Row][Col] = pDoc->m_stDirectGame.m_UP;
					break;
				case 2:
					pDoc->m_nGameBoard[Row][Col] = pDoc->m_stDirectGame.m_DOWN;
					break;
				case 6:
					pDoc->m_nGameBoard[Row][Col] = pDoc->m_stDirectGame.m_RIGHT;
					break;
				case 4:
					pDoc->m_nGameBoard[Row][Col] = pDoc->m_stDirectGame.m_LEFT;
					break;
			}
		}

}
*/



void CBoardSpeedySnakeView::SetGameTimer(int Timer)
{
	switch (Timer)
	{
 		case 1:
			SetTimer(TIMER_IN_GAME,SPEED_1 ,NULL);
			break;
		case 2:
			SetTimer(TIMER_IN_GAME,SPEED_2, NULL);
			break;
		case 3:
			SetTimer(TIMER_IN_GAME,SPEED_3, NULL);
			break;
		case 4:
			SetTimer(TIMER_IN_GAME,SPEED_4, NULL);
			break;
		case 5:
			SetTimer(TIMER_IN_GAME,SPEED_5, NULL);
			break;
		case 6:
			SetTimer(TIMER_IN_GAME,SPEED_6, NULL);
			break;
	}
}

void CBoardSpeedySnakeView::OnFileSaveGame() 
{
	// TODO: Add your command handler code here

	CString str;
	static char BASED_CODE szFilterSave[] = "Save Game Files  (*.sav) | *.sav";

	CBoardSpeedySnakeDoc* pDoc = GetDocument();

	KillTimer(TIMER_IN_GAME);

	CFileDialog dlgSave(FALSE,"SAV","*.sav",NULL,szFilterSave);
	if (dlgSave.DoModal() == IDOK) {
	   FILE *FileToSave;

		if( (FileToSave  = fopen(dlgSave.GetPathName(), "w" )) != NULL )
		{
			PrintToFile(FileToSave);
			fclose(FileToSave);
		}

//		SetGameTimer(pDoc->m_nSpeed);

	}

}

void CBoardSpeedySnakeView::OnFileOpenSaveGame() 
{
	// TODO: Add your command handler code here
	static char BASED_CODE szFilterOpen[] = "Save Game Files  (*.sav) | *.sav";

	CBoardSpeedySnakeDoc* pDoc = GetDocument();

	pDoc->InPause = FALSE;

	CFileDialog dlgOpen(TRUE,"SAV","*.sav",NULL,szFilterOpen);
	if (dlgOpen.DoModal() == IDOK) 
	{
	    FILE *FileToOpen;

		if( (FileToOpen = fopen(dlgOpen.GetPathName(), "r" )) != NULL )
		{
			InitFromSaveFile(FileToOpen);
			fclose(FileToOpen);
		}

		pDoc->SetFireOnStatusBar();
		SetGameTimer(pDoc->m_nSpeed);
	}	
}

void CBoardSpeedySnakeView::PrintToFile(FILE *TFile)
{

  	CBoardSpeedySnakeDoc* pDoc = GetDocument();

	fprintf(TFile,"%d ",pDoc->EatFire);
	fprintf(TFile,"%d ",pDoc->EatDuvdevan);
	fprintf(TFile,"%d ",pDoc->m_nDirection.x);
	fprintf(TFile,"%d ",pDoc->m_nDirection.y);
	fprintf(TFile,"%d ",pDoc->m_nLavel);
	fprintf(TFile,"%d ",pDoc->m_nMaxDuvdevanInLavel);
	fprintf(TFile,"%d ",pDoc->m_nNumberDuvdevan);
	fprintf(TFile,"%d ",pDoc->m_nNumberDuvdevanToFire);
	fprintf(TFile,"%d ",pDoc->m_nRama);
	fprintf(TFile,"%d ",pDoc->m_nScore);
	fprintf(TFile,"%d ",pDoc->m_nScoreForOneDuvdevan);
	fprintf(TFile,"%d ",pDoc->m_nSpeed);
	fprintf(TFile,"%d ",pDoc->m_stHeadPosition.Curr.x);
	fprintf(TFile,"%d ",pDoc->m_stHeadPosition.Curr.y);
	fprintf(TFile,"%d ",pDoc->m_stTailPosition.Curr.x);
	fprintf(TFile,"%d ",pDoc->m_stTailPosition.Curr.y);
	fprintf(TFile,"%d ",pDoc->ThereIsFire);
	fprintf(TFile,"%d ",AfterCtrlUp);
	fprintf(TFile,"%d ",AfterKeyUp);
	fprintf(TFile,"%d ",InGame);

	fprintf(TFile,"\n");

	for (int Row = 0; Row < HEIGHTBOARD; Row++)
	{
		for (int Col = 0; Col < WIDTHBOARD; Col++)
		{
	    	if (pDoc->m_nGameBoard[Row][Col] == pDoc->m_stDirectGame.m_BLANK)
				fprintf(TFile,"%d ",BLANK);
			else if (pDoc->m_nGameBoard[Row][Col] == pDoc->m_stDirectGame.m_UP)
				fprintf(TFile,"%d ",UP);
			else if (pDoc->m_nGameBoard[Row][Col] == pDoc->m_stDirectGame.m_DOWN)
				fprintf(TFile,"%d ",DOWN);
			else if (pDoc->m_nGameBoard[Row][Col] == pDoc->m_stDirectGame.m_RIGHT)
				fprintf(TFile,"%d ",RIGHT);
			else if (pDoc->m_nGameBoard[Row][Col] == pDoc->m_stDirectGame.m_LEFT)
				fprintf(TFile,"%d ",LEFT);
			else if (pDoc->m_nGameBoard[Row][Col] == pDoc->m_stDirectGame.m_WALL)
				fprintf(TFile,"%d ",WALL);
			else if (pDoc->m_nGameBoard[Row][Col] == pDoc->m_stDirectGame.m_FIRE)
				fprintf(TFile,"%d ",FIRE);
			else if (pDoc->m_nGameBoard[Row][Col] == pDoc->m_stDirectGame.m_DUVDEVAN)
				fprintf(TFile,"%d ",DUVDEVAN);
			else 
				fprintf(TFile,"%d ",BLANK);
		}
		fprintf(TFile,"\n");
	}

}

void CBoardSpeedySnakeView::InitFromSaveFile(FILE *TSaveFile)
{
	int Tinf;

  	CBoardSpeedySnakeDoc* pDoc = GetDocument();

	fscanf(TSaveFile,"%d",&pDoc->EatFire);
	fscanf(TSaveFile,"%d",&pDoc->EatDuvdevan);
	fscanf(TSaveFile,"%d",&pDoc->m_nDirection.x);
	fscanf(TSaveFile,"%d",&pDoc->m_nDirection.y);
	fscanf(TSaveFile,"%d",&pDoc->m_nLavel);
	fscanf(TSaveFile,"%d",&pDoc->m_nMaxDuvdevanInLavel);
	fscanf(TSaveFile,"%d",&pDoc->m_nNumberDuvdevan);
	fscanf(TSaveFile,"%d",&pDoc->m_nNumberDuvdevanToFire);
	fscanf(TSaveFile,"%d",&pDoc->m_nRama);
	fscanf(TSaveFile,"%d",&pDoc->m_nScore);
	fscanf(TSaveFile,"%d",&pDoc->m_nScoreForOneDuvdevan);
	fscanf(TSaveFile,"%d",&pDoc->m_nSpeed);
	fscanf(TSaveFile,"%d",&pDoc->m_stHeadPosition.Curr.x);
	fscanf(TSaveFile,"%d",&pDoc->m_stHeadPosition.Curr.y);
	fscanf(TSaveFile,"%d",&pDoc->m_stTailPosition.Curr.x);
	fscanf(TSaveFile,"%d",&pDoc->m_stTailPosition.Curr.y);
	fscanf(TSaveFile,"%d",&pDoc->ThereIsFire);
	fscanf(TSaveFile,"%d",&AfterCtrlUp);
	fscanf(TSaveFile,"%d",&AfterKeyUp);
	fscanf(TSaveFile,"%d",&InGame);

	for (int Row = 0; Row < HEIGHTBOARD; Row++)
	{
		for (int Col = 0; Col < WIDTHBOARD; Col++)
		{
			fscanf(TSaveFile,"%d",&Tinf);
			switch (Tinf)
			{
				case UP:
					pDoc->m_nGameBoard[Row][Col] = pDoc->m_stDirectGame.m_UP;
					break;
				case DOWN:
					pDoc->m_nGameBoard[Row][Col] = pDoc->m_stDirectGame.m_DOWN;
					break;
				case RIGHT:
					pDoc->m_nGameBoard[Row][Col] = pDoc->m_stDirectGame.m_RIGHT;
					break;
				case LEFT:
					pDoc->m_nGameBoard[Row][Col] = pDoc->m_stDirectGame.m_LEFT;
					break;
				case WALL:
					pDoc->m_nGameBoard[Row][Col] = pDoc->m_stDirectGame.m_WALL;
					break;
				case FIRE:
					pDoc->m_nGameBoard[Row][Col] = pDoc->m_stDirectGame.m_FIRE;
					break;
				case DUVDEVAN:
					pDoc->m_nGameBoard[Row][Col] = pDoc->m_stDirectGame.m_DUVDEVAN;
					break;
				default:
					pDoc->m_nGameBoard[Row][Col] = pDoc->m_stDirectGame.m_BLANK;
					break;
			}
		}
	}
}

void CBoardSpeedySnakeView::OnLoadHighscore() 
{
	// TODO: Add your command handler code here
	DlgHighScore.DoModal();	
}

void CBoardSpeedySnakeView::SaveScoreInReg()
{
     CBoardSpeedySnakeDoc* pDoc = GetDocument();

	 (DlgPlayerName.m_strScore).Format("%d",pDoc->m_nScore);
	 (DlgPlayerName.m_strLavel).Format("%d",pDoc->m_nLavel);
	 (DlgPlayerName.m_strRama).Format("%d",pDoc->m_nRama + 1);
     (DlgPlayerName.m_strSpeed).Format("%d",pDoc->m_nSpeed);

	 DlgPlayerName.DoModal();
	 KillTimer(TIMER_IN_GAME);

/*	 
	 CString PlayerName;
	 CString Name;

	 PlayerName	= AfxGetApp()->GetProfileString("HighScore","Player1Name");
	 if (PlayerName.IsEmpty())
	 {
		 AfxGetApp()->WriteProfileString("HighScore","Player1Score",PlayerScore);
		 AfxGetApp()->WriteProfileString("HighScore","Player1Name",DlgHighScore.m_nPlayer1Name);
	 }
	 else
	 {
		 PlayerName	= AfxGetApp()->GetProfileString("HighScore","Player2Name");
		 if (PlayerName.IsEmpty())
		 {
			 AfxGetApp()->WriteProfileString("HighScore","Player1Score",PlayerScore);
			 AfxGetApp()->WriteProfileString("HighScore","Player1Name",DlgHighScore.m_nPlayer1Name);
		 }
		 else
		 {
			 PlayerName	= AfxGetApp()->GetProfileString("HighScore","Player3Name");
			 if (PlayerName.IsEmpty())
			 {
				 AfxGetApp()->WriteProfileString("HighScore","Player1Score",PlayerScore);
				 AfxGetApp()->WriteProfileString("HighScore","Player1Name",DlgHighScore.m_nPlayer1Name);
			 }
			 else;
		 }
	 }


		 DlgHighScore.m_nPlayer1Name  = "Lior";
	 DlgHighScore.m_nPlayer1Score = PlayerScore;
	 AfxGetApp()->WriteProfileString("HighScore","Player1Score",PlayerScore);
	 AfxGetApp()->WriteProfileString("HighScore","Player1Name",DlgHighScore.m_nPlayer1Name);
*/
}


bool CBoardSpeedySnakeView::DS_Init()
{
  for(int i = 0; i < DS_SOUNDS_NUM; i ++)      // Null out all the sound pointers
    m_lpDS_Sounds[i] = NULL;

  DS_CreateBufferFromWaveFile(m_cWavFire, DS_FIRE_SOUND);
  
  return true;
}

/////////////////////////////////////////////////////////////////////////////

bool CBoardSpeedySnakeView::DS_CreateBufferFromWaveFile(char* FileName, DWORD dwBuf)
{
  struct WaveHeader
  {
    BYTE        RIFF[4];          // "RIFF"
    DWORD       dwSize;           // Size of data to follow
    BYTE        WAVE[4];          // "WAVE"
    BYTE        fmt_[4];          // "fmt "
    DWORD       dw16;             // 16
    WORD        wOne_0;           // 1
    WORD        wChnls;           // Number of Channels
    DWORD       dwSRate;          // Sample Rate
    DWORD       BytesPerSec;      // Sample Rate
    WORD        wBlkAlign;        // 1
    WORD        BitsPerSample;    // Sample size
    BYTE        DATA[4];          // "DATA"
    DWORD       dwDSize;          // Number of Samples
  };

  // Open the wave file       
  FILE* pFile = fopen(FileName, "rb");
  if(!pFile)
    return false;

  // Read in the wave header          
  WaveHeader wavHdr;
  if (fread(&wavHdr, sizeof(wavHdr), 1, pFile) != 1) 
  {
    fclose(pFile);
    return NULL;
  }

  // Figure out the size of the data region
  DWORD dwSize = wavHdr.dwDSize;

  // Is this a stereo or mono file?
  BOOL bStereo = wavHdr.wChnls > 1 ? true : false;

  // Create the sound buffer for the wave file
  if(DS_CreateSoundBuffer(dwBuf, dwSize, wavHdr.dwSRate, wavHdr.BitsPerSample, wavHdr.wBlkAlign, bStereo) != TRUE)
  {
    // Close the file
    fclose(pFile);
    
    return false;
  }

  // Read the data for the wave file into the sound buffer
  if (!DS_ReadData(m_lpDS_Sounds[dwBuf], pFile, dwSize, sizeof(wavHdr))) 
  {
    fclose(pFile);
    return false;
  }
  fclose(pFile);
  return true;
}

bool CBoardSpeedySnakeView::DS_PlaySound(int nSound, DWORD dwFlags)
{


  if(m_lpDS_Sounds[nSound])  // Make sure we have a valid sound buffer
  {
	  m_lpDS_Sounds[nSound]->SetVolume(100);
      g_DX_Result = m_lpDS_Sounds[nSound]->Play(0, 0, dwFlags);    // Play the sound
	  DS_CHECK_ERROR("Error - DS - Play");

  }
  return true;
}

/////////////////////////////////////////////////////////////////////////////

void CBoardSpeedySnakeView::DS_Finish()
{
    for(int i = 0; i < DS_SOUNDS_NUM; i ++)
    {
      if(m_lpDS_Sounds[i])
      {       
        m_lpDS_Sounds[i]->Release();
        m_lpDS_Sounds[i] = NULL;
      }
    }
} 
/////////////////////////////////////////////////////////////////////////////

bool CBoardSpeedySnakeView::DS_CreateSoundBuffer(DWORD dwBuf, DWORD dwBufSize, DWORD dwFreq, DWORD dwBitsPerSample, DWORD dwBlkAlign, BOOL bStereo)
{
  PCMWAVEFORMAT pcmwf;
  DSBUFFERDESC dsbdesc;
  
  // Set up wave format structure.
  memset( &pcmwf, 0, sizeof(PCMWAVEFORMAT) );
  pcmwf.wf.wFormatTag         = WAVE_FORMAT_PCM;      
  pcmwf.wf.nChannels          = bStereo ? 2 : 1;
  pcmwf.wf.nSamplesPerSec     = dwFreq;
  pcmwf.wf.nBlockAlign        = (WORD)dwBlkAlign;
  pcmwf.wf.nAvgBytesPerSec    = pcmwf.wf.nSamplesPerSec * pcmwf.wf.nBlockAlign;
  pcmwf.wBitsPerSample        = (WORD)dwBitsPerSample;

  // Set up DSBUFFERDESC structure.
  memset(&dsbdesc, 0, sizeof(DSBUFFERDESC));  // Zero it out. 
  dsbdesc.dwSize              = sizeof(DSBUFFERDESC);
//  dsbdesc.dwFlags             = DSBCAPS_CTRLDEFAULT;  // Need default controls (pan, volume, frequency).
  dsbdesc.dwBufferBytes       = dwBufSize; 
  dsbdesc.lpwfxFormat         = (LPWAVEFORMATEX)&pcmwf;

 
  g_DX_Result = g_lpDS->CreateSoundBuffer(&dsbdesc, &m_lpDS_Sounds[dwBuf], NULL);
  DS_CHECK_ERROR("Error - DS - CreateSoundBuffer");
  return true;
}

/////////////////////////////////////////////////////////////////////////////

bool CBoardSpeedySnakeView::DS_ReadData(LPDIRECTSOUNDBUFFER lpDSB, FILE* pFile, DWORD dwSize, DWORD dwPos) 
{
  // Seek to correct position in file (if necessary)
  if (dwPos != 0xffffffff) 
  {
    if (fseek(pFile, dwPos, SEEK_SET) != 0) 
    {
      return false;
    }
  }

  // Lock data in buffer for writing
  LPVOID pData1;
  DWORD  dwData1Size;
  LPVOID pData2;
  DWORD  dwData2Size;
  HRESULT rval;

  rval = lpDSB->Lock(0, dwSize, &pData1, &dwData1Size, &pData2, &dwData2Size, DSBLOCK_FROMWRITECURSOR);
  if (rval != DS_OK)
  {
    return false;
  }

  // Read in first chunk of data
  if (dwData1Size > 0) 
  {
    if (fread(pData1, dwData1Size, 1, pFile) != 1) 
    {               
      return false;
    }
  }

  // read in second chunk if necessary
  if (dwData2Size > 0) 
  {
    if (fread(pData2, dwData2Size, 1, pFile) != 1) 
    {
      return false;
    }
  }

  // Unlock data in buffer
  rval = lpDSB->Unlock(pData1, dwData1Size, pData2, dwData2Size);
  if (rval != DS_OK)
  {
    return false;
  }

  return true;
}