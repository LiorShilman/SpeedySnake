// BoardSpeedySnakeDoc.cpp : implementation of the CBoardSpeedySnakeDoc class
//

#include "stdafx.h"
#include "BoardSpeedySnake.h"

#include "BoardSpeedySnakeDoc.h"
#include "MainFrm.h"

#include <ddraw.h>
#include <dsound.h>
#include <mmsystem.h> 



#ifdef _DEBUG
#define new DEBUG_NEW
#undef THIS_FILE
static char THIS_FILE[] = __FILE__;
#endif

/////////////////////////////////////////////////////////////////////////////
// CBoardSpeedySnakeDoc

IMPLEMENT_DYNCREATE(CBoardSpeedySnakeDoc, CDocument)

BEGIN_MESSAGE_MAP(CBoardSpeedySnakeDoc, CDocument)
	//{{AFX_MSG_MAP(CBoardSpeedySnakeDoc)
		// NOTE - the ClassWizard will add and remove mapping macros here.
		//    DO NOT EDIT what you see in these blocks of generated code!
	//}}AFX_MSG_MAP
END_MESSAGE_MAP()

#include "stdafx.h"

/////////////////////////////////////////////////////////////////////////////
// CBoardSpeedySnakeDoc construction/destruction

CBoardSpeedySnakeDoc::CBoardSpeedySnakeDoc():m_nScore(0),
											 m_nLavel(1), 
											 m_nSpeed(5),
											 m_nRama (2),
											 NewLavel(FALSE),
											 EatDuvdevan(FALSE),
											 EatFire(FALSE),
											 InPause(FALSE),
											 ThereIsFire(FALSE),
											 m_nMaxDuvdevanInLavel(10),
											 m_nNumberDuvdevanToFire(10),
											 m_nNumberDuvdevan(0)

{
	// TODO: add one-time construction code here
	m_stDirectGame.m_UP.x     =  0;
	m_stDirectGame.m_UP.y     = -1;
	m_stDirectGame.m_DOWN.x   =  0;
	m_stDirectGame.m_DOWN.y   =  1;
	m_stDirectGame.m_LEFT.x   = -1;
	m_stDirectGame.m_LEFT.y   =  0;
	m_stDirectGame.m_RIGHT.x  =  1;
	m_stDirectGame.m_RIGHT.y  =  0;
    m_stDirectGame.m_DUVDEVAN.x  = -1;
	m_stDirectGame.m_DUVDEVAN.y  = -1;
	m_stDirectGame.m_WALL.x   = -2;
	m_stDirectGame.m_WALL.y   = -2;
	m_stDirectGame.m_BLANK.x  =  0;
	m_stDirectGame.m_BLANK.y  =  0; 
	m_stDirectGame.m_FIRE.x   = -3;
	m_stDirectGame.m_FIRE.y   = -3;


	// Init HIcon In Game.
	m_stHiconInGame.m_HDuvdevan     = (HICON )LoadImage(AfxGetInstanceHandle(),MAKEINTRESOURCE(IDI_DUVDEVAN),IMAGE_ICON,10,10,0 );
	m_stHiconInGame.m_HWall         = (HICON )LoadImage(AfxGetInstanceHandle(),MAKEINTRESOURCE(IDI_WALL),IMAGE_ICON,10,10,0 );
	m_stHiconInGame.m_HSnake        = (HICON )LoadImage(AfxGetInstanceHandle(),MAKEINTRESOURCE(IDI_SNAKE),IMAGE_ICON,10,10,0 );
	m_stHiconInGame.m_HheadUp       = (HICON )LoadImage(AfxGetInstanceHandle(),MAKEINTRESOURCE(IDI_HEAD_UP),IMAGE_ICON,10,10,0 );
	m_stHiconInGame.m_HheadRight    = (HICON )LoadImage(AfxGetInstanceHandle(),MAKEINTRESOURCE(IDI_HEAD_RIGHT),IMAGE_ICON,10,10,0 );
	m_stHiconInGame.m_HheadLeft     = (HICON )LoadImage(AfxGetInstanceHandle(),MAKEINTRESOURCE(IDI_HEAD_LEFT),IMAGE_ICON,10,10,0 );
	m_stHiconInGame.m_HheadDown     = (HICON )LoadImage(AfxGetInstanceHandle(),MAKEINTRESOURCE(IDI_HEAD_DOWN),IMAGE_ICON,10,10,0 );
	m_stHiconInGame.m_HBlank        = (HICON )LoadImage(AfxGetInstanceHandle(),MAKEINTRESOURCE(IDI_BLANK),IMAGE_ICON,10,10,0 );
	m_stHiconInGame.m_HFire         = (HICON )LoadImage(AfxGetInstanceHandle(),MAKEINTRESOURCE(IDI_FIRE),IMAGE_ICON,10,10,0 );
}

CBoardSpeedySnakeDoc::~CBoardSpeedySnakeDoc()
{
}

BOOL CBoardSpeedySnakeDoc::OnNewDocument()
{
	if (!CDocument::OnNewDocument())
		return FALSE;

	// TODO: add reinitialization code here
	// (SDI documents will reuse this document)

	return TRUE;
}



/////////////////////////////////////////////////////////////////////////////
// CBoardSpeedySnakeDoc serialization

void CBoardSpeedySnakeDoc::Serialize(CArchive& ar)
{
	if (ar.IsStoring())
	{
		// TODO: add storing code here
	}
	else
	{
		// TODO: add loading code here
	}
}

/////////////////////////////////////////////////////////////////////////////
// CBoardSpeedySnakeDoc diagnostics

#ifdef _DEBUG
void CBoardSpeedySnakeDoc::AssertValid() const
{
	CDocument::AssertValid();
}

void CBoardSpeedySnakeDoc::Dump(CDumpContext& dc) const
{
	CDocument::Dump(dc);
}
#endif //_DEBUG

/////////////////////////////////////////////////////////////////////////////
// CBoardSpeedySnakeDoc commands

void CBoardSpeedySnakeDoc::RandomDuvdevan()
{
	CPoint TDuvdevan;

	// Init Random From System Time.
	srand( (unsigned)time( NULL ) ); 

	TDuvdevan.x = (rand() % (WIDTHBOARD - 2)) + 1;
	TDuvdevan.y = (rand() % (HEIGHTBOARD - 2)) + 1;


	while  ((m_nGameBoard[TDuvdevan.y][TDuvdevan.x] != m_stDirectGame.m_BLANK) ||
		    (TDuvdevan.x >= m_stItemInGame.m_pDuvdevan.x - 2 && TDuvdevan.x <= m_stItemInGame.m_pDuvdevan.x + 2) ||
			(TDuvdevan.x >= m_stItemInGame.m_pDuvdevan.y - 2 && TDuvdevan.y <= m_stItemInGame.m_pDuvdevan.y + 2) ||
			(TDuvdevan.x >= m_stHeadPosition.Curr.x - 2 && TDuvdevan.x <= m_stHeadPosition.Curr.x + 2) ||
			(TDuvdevan.x >= m_stHeadPosition.Curr.y - 2 && TDuvdevan.y <= m_stHeadPosition.Curr.y + 2))
	{
		TDuvdevan.x = (rand() % (WIDTHBOARD - 2)) + 1;
		TDuvdevan.y = (rand() % (HEIGHTBOARD - 2)) + 1;
	}

	m_nGameBoard[TDuvdevan.y][TDuvdevan.x] = m_stDirectGame.m_DUVDEVAN;
	
	m_stItemInGame.m_pDuvdevan = TDuvdevan;
}

void CBoardSpeedySnakeDoc::RandomWall()
{
	CPoint TWall;
	BOOL ReturnValid;

	// Init Random From System Time.
	srand( (unsigned)time( NULL ) ); 

	for (int NumberWall = 0 ; NumberWall < m_nRama ; NumberWall++)
	{
  
		TWall.x = (rand() % (WIDTHBOARD - 2)) + 1;
		TWall.y = (rand() % (HEIGHTBOARD - 2)) + 1;

		ReturnValid = ValidateWallPlace(TWall.y,TWall.x);
		while  ((m_nGameBoard[TWall.y][TWall.x] != m_stDirectGame.m_BLANK) ||
			    (ReturnValid == FALSE))
		{
			TWall.x = (rand() % (WIDTHBOARD - 2)) + 1;
			TWall.y = (rand() % (HEIGHTBOARD - 2)) + 1;
			ReturnValid = ValidateWallPlace(TWall.y,TWall.x);
		}

		m_nGameBoard[TWall.y][TWall.x] = m_stDirectGame.m_WALL;
	}

	RandomDuvdevan();
}

void CBoardSpeedySnakeDoc::RandomFire()
{
	CPoint TFire;

	// Init Random From System Time.
	srand( (unsigned)time( NULL ) ); 

	TFire.x = (rand() % (WIDTHBOARD - 2)) + 1;
	TFire.y = (rand() % (HEIGHTBOARD - 2)) + 1;


	while (m_nGameBoard[TFire.y][TFire.x] != m_stDirectGame.m_BLANK)
	{
		TFire.x = (rand() % (WIDTHBOARD - 2)) + 1;
		TFire.y = (rand() % (HEIGHTBOARD - 2)) + 1;
	
	}

	m_nGameBoard[TFire.y][TFire.x] = m_stDirectGame.m_FIRE;
	ThereIsFire = TRUE;
}

void CBoardSpeedySnakeDoc::Fire()
{
	if (m_nDirection == m_stDirectGame.m_LEFT)
	   FireNow(4);
	else if (m_nDirection == m_stDirectGame.m_RIGHT)
	   FireNow(6);
	else if (m_nDirection == m_stDirectGame.m_UP)
	   FireNow(8);
	else
	   FireNow(2);
}

void CBoardSpeedySnakeDoc::FireNow(int Direct)
{
	int Col;
	int Row;

	BOOL FireDuvdevan = FALSE;

	switch (Direct)
	{
		case LEFT:
			for (Col = m_stHeadPosition.Curr.x - 1; Col >=0 ; Col--)
			{
				if (m_nGameBoard[m_stHeadPosition.Curr.y][Col] == m_stDirectGame.m_DUVDEVAN)
				   FireDuvdevan = TRUE;

				if (m_nGameBoard[m_stHeadPosition.Curr.y][Col] != m_stDirectGame.m_UP &&
					m_nGameBoard[m_stHeadPosition.Curr.y][Col] != m_stDirectGame.m_DOWN &&
					m_nGameBoard[m_stHeadPosition.Curr.y][Col] != m_stDirectGame.m_RIGHT &&
					m_nGameBoard[m_stHeadPosition.Curr.y][Col] != m_stDirectGame.m_LEFT &&
					(Col > 0))
					   m_nGameBoard[m_stHeadPosition.Curr.y][Col] = m_stDirectGame.m_BLANK;

				// If Sanke Eat Duvdevan Then...
				if (FireDuvdevan)
				{
			        m_nScore += m_nScoreForOneDuvdevan;
					m_nNumberDuvdevan += 1;

					if (m_nNumberDuvdevan >= m_nMaxDuvdevanInLavel)
					{
						// Over Lavel.
						m_nLavel = ((m_nLavel) % 6) + 1;
						NewLavel = TRUE;
					}

					EatDuvdevan = TRUE;
					RandomWall();
					FireDuvdevan = FALSE;
				}
			}
			break;
		case RIGHT:
			for (Col = m_stHeadPosition.Curr.x + 1; Col < WIDTHBOARD ; Col++)
			{
				if (m_nGameBoard[m_stHeadPosition.Curr.y][Col] == m_stDirectGame.m_DUVDEVAN)
				   FireDuvdevan = TRUE;

				if (m_nGameBoard[m_stHeadPosition.Curr.y][Col] != m_stDirectGame.m_UP &&
					m_nGameBoard[m_stHeadPosition.Curr.y][Col] != m_stDirectGame.m_DOWN &&
					m_nGameBoard[m_stHeadPosition.Curr.y][Col] != m_stDirectGame.m_RIGHT &&
					m_nGameBoard[m_stHeadPosition.Curr.y][Col] != m_stDirectGame.m_LEFT &&
					(Col != WIDTHBOARD - 1))
					   m_nGameBoard[m_stHeadPosition.Curr.y][Col] = m_stDirectGame.m_BLANK;

				// If Sanke Eat Duvdevan Then...
				if (FireDuvdevan)
				{
			        m_nScore += m_nScoreForOneDuvdevan;
					m_nNumberDuvdevan += 1;

					if (m_nNumberDuvdevan >= m_nMaxDuvdevanInLavel)
					{
						// Over Lavel.
						m_nLavel = ((m_nLavel) % 6) + 1;
						NewLavel = TRUE;
					}

					EatDuvdevan = TRUE;
					RandomWall();
					FireDuvdevan = FALSE;
				}
			}
			break;
		case UP:
			for (Row = m_stHeadPosition.Curr.y - 1; Row >=0 ; Row--)
			{
				if (m_nGameBoard[Row][m_stHeadPosition.Curr.x]== m_stDirectGame.m_DUVDEVAN)
				   FireDuvdevan = TRUE;

				if (m_nGameBoard[Row][m_stHeadPosition.Curr.x] != m_stDirectGame.m_UP &&
					m_nGameBoard[Row][m_stHeadPosition.Curr.x] != m_stDirectGame.m_DOWN &&
					m_nGameBoard[Row][m_stHeadPosition.Curr.x] != m_stDirectGame.m_RIGHT &&
					m_nGameBoard[Row][m_stHeadPosition.Curr.x] != m_stDirectGame.m_LEFT &&
					(Row > 0))
					   m_nGameBoard[Row][m_stHeadPosition.Curr.x] = m_stDirectGame.m_BLANK;

				// If Sanke Eat Duvdevan Then...
				if (FireDuvdevan)
				{
			        m_nScore += m_nScoreForOneDuvdevan;
					m_nNumberDuvdevan += 1;

					if (m_nNumberDuvdevan >= m_nMaxDuvdevanInLavel)
					{
						// Over Lavel.
						m_nLavel = ((m_nLavel) % 6) + 1;
						NewLavel = TRUE;
					}

					EatDuvdevan = TRUE;
					RandomWall();
					FireDuvdevan = FALSE;

				}
			}
			break;
		case DOWN :
			for (Row = m_stHeadPosition.Curr.y + 1; Row < HEIGHTBOARD ; Row++)
			{
				if (m_nGameBoard[Row][m_stHeadPosition.Curr.x]== m_stDirectGame.m_DUVDEVAN)
				   FireDuvdevan = TRUE;

				if (m_nGameBoard[Row][m_stHeadPosition.Curr.x] != m_stDirectGame.m_UP &&
					m_nGameBoard[Row][m_stHeadPosition.Curr.x] != m_stDirectGame.m_DOWN &&
					m_nGameBoard[Row][m_stHeadPosition.Curr.x] != m_stDirectGame.m_RIGHT &&
					m_nGameBoard[Row][m_stHeadPosition.Curr.x] != m_stDirectGame.m_LEFT &&
					(Row != HEIGHTBOARD - 1))
					   m_nGameBoard[Row][m_stHeadPosition.Curr.x] = m_stDirectGame.m_BLANK;

				// If Sanke Eat Duvdevan Then...
				if (FireDuvdevan)
				{
			        m_nScore += m_nScoreForOneDuvdevan;
					m_nNumberDuvdevan += 1;

					if (m_nNumberDuvdevan >= m_nMaxDuvdevanInLavel)
					{
						// Over Lavel.
						m_nLavel = ((m_nLavel) % 6) + 1;
						NewLavel = TRUE;
					}

					EatDuvdevan = TRUE;
					RandomWall();
					FireDuvdevan = FALSE;

				}
			}
			break;
	}		

	EatFire = FALSE;
	SetFireOnStatusBar();
}



void CBoardSpeedySnakeDoc::SaveInRegister()
{

}

void CBoardSpeedySnakeDoc::SetFireOnStatusBar()
{
	CMainFrame* pFrame = (CMainFrame*)AfxGetApp()->m_pMainWnd;
	CStatusBar* pStatus = &pFrame->m_wndStatusBar;
	CStatusStatic* pStatic = &pFrame->c_StatusIcon;

	if (EatFire)
	{
		if(pStatic->m_hWnd == NULL)
		{
			pStatic->Create(pStatus,ID_INDICATOR_ICON, WS_VISIBLE | SS_ICON | SS_CENTERIMAGE);
			IconStatusBar = (HICON)::LoadImage(AfxGetInstanceHandle(),
						MAKEINTRESOURCE(IDI_FIRE),
						IMAGE_ICON, 10, 10, LR_SHARED)	;
			pStatic->SetIcon(IconStatusBar);
		}
		else
		{
			pStatic->DestroyWindow();
			pStatic->Create(pStatus,ID_INDICATOR_ICON, WS_VISIBLE | SS_ICON | SS_CENTERIMAGE);
			IconStatusBar = (HICON)::LoadImage(AfxGetInstanceHandle(),
							MAKEINTRESOURCE(IDI_FIRE),
							IMAGE_ICON, 10, 10, LR_SHARED)	;
			pStatic->SetIcon(IconStatusBar);
		}
	}
	else
	{
		if(pStatic->m_hWnd == NULL)
		{
			pStatic->Create(pStatus,ID_INDICATOR_ICON, WS_VISIBLE | SS_ICON | SS_CENTERIMAGE);
			IconStatusBar = (HICON)::LoadImage(AfxGetInstanceHandle(),
						MAKEINTRESOURCE(IDI_NO_FIRE),
						IMAGE_ICON, 10, 10, LR_SHARED)	;
			pStatic->SetIcon(IconStatusBar);
		}
		else
		{
			pStatic->DestroyWindow();
			pStatic->Create(pStatus,ID_INDICATOR_ICON, WS_VISIBLE | SS_ICON | SS_CENTERIMAGE);
			IconStatusBar = (HICON)::LoadImage(AfxGetInstanceHandle(),
							MAKEINTRESOURCE(IDI_NO_FIRE),
							IMAGE_ICON, 10, 10, LR_SHARED)	;
			pStatic->SetIcon(IconStatusBar);
		}
	}
}

BOOL CBoardSpeedySnakeDoc::ValidateWallPlace(int Y, int X)
{
	 if      ((m_nGameBoard[Y-1][X-1] != m_stDirectGame.m_WALL) &&
			 (m_nGameBoard[Y-1][X]   != m_stDirectGame.m_WALL) &&
			 (m_nGameBoard[Y-1][X+1] != m_stDirectGame.m_WALL) &&
			 (m_nGameBoard[Y][X-1]   != m_stDirectGame.m_WALL) &&
			 (m_nGameBoard[Y][X+1]   != m_stDirectGame.m_WALL) &&
			 (m_nGameBoard[Y+1][X-1] != m_stDirectGame.m_WALL) &&
		     (m_nGameBoard[Y+1][X]   != m_stDirectGame.m_WALL) &&
		     (m_nGameBoard[Y+1][X+1] != m_stDirectGame.m_WALL))
			     return  TRUE;
	else
		return FALSE;


}
